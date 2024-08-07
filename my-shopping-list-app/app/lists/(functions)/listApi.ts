export interface List {
  id: number;
  name: string;
  position: number;
}

// ====== Fetch Lists ======
export const fetchLists = async (): Promise<List[]> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists`
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to fetch lists");
    }
    return (await response.json()) as List[];
  } catch (error: unknown) {
    console.error("Error fetching lists:", error);
    throw error;
  }
};

// ====== Create List ======
export const createList = async (name: string): Promise<List> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw data.error;
    }
    return data as List;
  } catch (error: unknown) {
    console.error("Error creating list:", error);
    throw error;
  }
};

// ====== Update List ======
export const updateList = async (
  listId: number,
  updatedName: string
): Promise<void> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists/${listId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: updatedName }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to update list");
    }
  } catch (error: unknown) {
    console.error("Error updating list:", error);
    throw error;
  }
};

// ====== Update List Positions ======
export const updateListPositions = async (
  positions: { id: number; position: number }[]
): Promise<void> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists/positions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ positions }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to update list positions");
    }
  } catch (error: unknown) {
    console.error("Error updating list positions:", error);
    throw error;
  }
};

// ====== Delete List ======
export const deleteList = async (listId: number): Promise<void> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists/${listId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to delete list");
    }
  } catch (error: unknown) {
    console.error("Error deleting list:", error);
    throw error;
  }
};

// ====================== List Items ======================

export interface ListItem {
  id: number;
  content: string;
  is_complete: boolean;
  position: number;
}

// ====== Fetch List Items ======
export const fetchListItems = async (listId: number): Promise<ListItem[]> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists/${listId}/items`
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to fetch list items");
    }
    const data: ListItem[] = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("Error fetching list items:", error);
    throw error;
  }
};

// ====== Update List Item Positions ======
export const updateListItemPositions = async (
  positions: { id: number; position: number }[]
): Promise<void> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/list-items/positions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ positions }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to update list item positions");
    }
  } catch (error: unknown) {
    console.error("Error updating list item positions:", error);
    throw error;
  }
};

// ====== Create List Item ======
export const createListItem = async (
  listId: number,
  content: string
): Promise<ListItem> => {
  if (!content) {
    throw new Error("Content is required");
  }

  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/lists/${listId}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to create list item");
    }
    const createdItem: ListItem = await response.json();
    return createdItem;
  } catch (error: unknown) {
    console.error("Error creating list item:", error);
    throw error;
  }
};

// ====== Update List Item ======
export const updateListItem = async (
  itemId: number,
  updatedContent: string,
  updatedIsComplete: boolean,
  updatedPosition?: number
): Promise<void> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/items/${itemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: updatedContent,
          is_complete: updatedIsComplete,
          position: updatedPosition,
        }),
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to update list item");
    }
  } catch (error: unknown) {
    console.error("Error updating list item:", error);
    throw error;
  }
};

// ====== Delete List Item ======
export const deleteListItem = async (itemId: number): Promise<void> => {
  try {
    const response: Response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_URL}/api/items/${itemId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw data.error || new Error("Failed to delete list item");
    }
  } catch (error: unknown) {
    console.error("Error deleting list item:", error);
    throw error;
  }
};
