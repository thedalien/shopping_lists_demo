const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 80;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(cors());
app.use(express.json());

// Lists API

app.get("/", (req, res) => {
  res.send(
    `Visit <a href="my-shopping-list-app-ten.vercel.app">List App</a> to see the app.`
  );
});

// Search API for lists and list items ------------------------------------
app.get("/api/search", async (req, res) => {
  const { query } = req.query;
  console.log("Search API called", query);

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    // Search in lists
    const { data: listResults, error: listError } = await supabase
      .from("lists")
      .select("id, name, position")
      .ilike("name", `%${query}%`);

    if (listError) throw listError;

    // Search in list_items
    const { data: itemResults, error: itemError } = await supabase
      .from("list_items")
      .select("id, content, list_id, position")
      .ilike("content", `%${query}%`);

    if (itemError) throw itemError;

    // Combine and send results
    console.log(
      "Search results",
      JSON.stringify(listResults),
      JSON.stringify(itemResults)
    );
    res.json({
      lists: listResults,
      items: itemResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all lists ------------------------------------
app.get("/api/lists", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .order("position", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new list ------------------------------------
app.post("/api/lists", async (req, res) => {
  const { name } = req.body;
  try {
    // Check for case-insensitive duplicate
    const { data: existingLists, error: checkError } = await supabase
      .from("lists")
      .select("name");

    if (checkError) {
      throw checkError;
    }

    if (
      existingLists.some(
        (list) => list.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      return res.status(409).json({
        error: `Seznam s názvem "${name}" (nebo shoda bez ohledu na velká písmen) již existuje.`,
      });
    }

    // Get the maximum position
    const { data: maxPositionData, error: maxPositionError } = await supabase
      .from("lists")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);

    if (maxPositionError) throw maxPositionError;

    const newPosition =
      maxPositionData.length > 0 ? maxPositionData[0].position + 1 : 1;

    const { data, error } = await supabase
      .from("lists")
      .insert({ name, position: newPosition })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a list ------------------------------------
app.put("/api/lists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const { data, error } = await supabase
      .from("lists")
      .update({ name })
      .eq("id", id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update list positions ------------------------------------
app.post("/api/lists/positions", async (req, res) => {
  console.log("Update positions called");
  try {
    const { positions } = req.body;

    // Convert the positions array to an object
    const positionsObject = positions.reduce((acc, { id, position }) => {
      acc[id] = position;
      return acc;
    }, {});

    // Update positions using the RPC function
    const { error } = await supabase.rpc("update_list_positions", {
      new_positions: positionsObject,
    });

    if (error) throw error;
    res.json({ message: "Positions updated successfully" });
  } catch (error) {
    console.error("Error updating list positions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a list ------------------------------------
app.delete("/api/lists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("lists").delete().eq("id", id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Items API ------------------------------------

// Get all items for a list ------------------------------------
app.get("/api/lists/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", id)
      .order("position", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update list item positions ------------------------------------
app.post("/api/list-items/positions", async (req, res) => {
  console.log("Update list item positions called");
  try {
    const { positions } = req.body;

    // Convert the positions array to an object
    const positionsObject = positions.reduce((acc, { id, position }) => {
      acc[id] = position;
      return acc;
    }, {});

    // Update positions using the RPC function
    const { error } = await supabase.rpc("update_list_item_positions", {
      new_positions: positionsObject,
    });

    if (error) throw error;
    res.json({ message: "List item positions updated successfully" });
  } catch (error) {
    console.error("Error updating list item positions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new list item ------------------------------------
app.post("/api/lists/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_complete = false } = req.body;

    const { data: existingItems, error: checkError } = await supabase
      .from("list_items")
      .select("content")
      .eq("list_id", id);

    if (checkError) throw checkError;

    if (
      existingItems.some(
        (item) => item.content.toLowerCase() === content.toLowerCase()
      )
    ) {
      return res.status(409).json({ error: "Nalezena duplicitní položka." });
    }

    // Get the maximum position for the current list
    const { data: maxPositionData, error: maxPositionError } = await supabase
      .from("list_items")
      .select("position")
      .eq("list_id", id)
      .order("position", { ascending: false })
      .limit(1);

    if (maxPositionError) throw maxPositionError;

    const newPosition =
      maxPositionData.length > 0 ? maxPositionData[0].position + 1 : 1;

    const { data, error } = await supabase
      .from("list_items")
      .insert({ list_id: id, content, is_complete, position: newPosition })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a list item ------------------------------------
app.put("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_complete, position } = req.body;
    const { data, error } = await supabase
      .from("list_items")
      .update({ content, is_complete, position })
      .eq("id", id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a list item ------------------------------------
app.delete("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("list_items").delete().eq("id", id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
