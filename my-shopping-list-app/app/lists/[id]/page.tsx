"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { title } from "@/components/primitives";
import { Button, Input, Card, Checkbox, Skeleton } from "@nextui-org/react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import {
  fetchListItems,
  createListItem,
  updateListItem,
  deleteListItem,
  updateListItemPositions,
  ListItem,
} from "../(functions)/listApi";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface DraggableListItemProps {
  item: ListItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  handleUpdateListItem: (
    itemId: number,
    updatedContent: string,
    updatedIsComplete: boolean
  ) => Promise<void>;
  handleDeleteListItem: (itemId: number) => Promise<void>;
  setEditingItem: (item: ListItem | null) => void;
  editingItem: ListItem | null;
}

const DraggableListItem = ({
  item,
  index,
  moveItem,
  handleUpdateListItem,
  handleDeleteListItem,
  setEditingItem,
  editingItem,
}: DraggableListItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, drop] = useDrop({
    accept: "LIST_ITEM",
    hover(draggedItem: { index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "LIST_ITEM",
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-6">
        {editingItem?.id === item.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateListItem(
                item.id,
                editingItem.content,
                editingItem.is_complete
              );
              setEditingItem(null);
            }}
            className="flex gap-4"
          >
            <Input
              value={editingItem.content}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  content: e.target.value,
                })
              }
              className="flex-grow"
            />
            <Button color="success" type="submit">
              Uložit
            </Button>
            <Button color="default" onClick={() => setEditingItem(null)}>
              Zrušit
            </Button>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Checkbox
                isSelected={item.is_complete}
                onChange={(event) =>
                  handleUpdateListItem(
                    item.id,
                    item.content,
                    event.target.checked
                  )
                }
                size="lg"
              />
              <span
                className={`text-xl ${item.is_complete ? "line-through text-gray-400" : ""}`}
              >
                {item.content}
              </span>
            </div>
            <div className="flex gap-4">
              <Button color="primary" onClick={() => setEditingItem(item)}>
                Upravit
              </Button>
              <Button
                color="danger"
                onClick={() => handleDeleteListItem(item.id)}
              >
                Smazat
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default function ListItemsPage() {
  const { id } = useParams();
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [newItemContent, setNewItemContent] = useState("");
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await fetchListItems(Number(id));
      setListItems(items);
      setError(null);
    } catch (error) {
      console.error("Nepodařilo se načíst položky seznamu:", error);
      setError("Nepodařilo se načíst položky seznamu. Zkuste to prosím znovu.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadListItems();
  }, [loadListItems]);

  const handleCreateListItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemContent.trim()) return;
    try {
      await createListItem(Number(id), newItemContent);
      setNewItemContent("");
      await loadListItems();
      setError(null);
    } catch (error) {
      console.error("Nepodařilo se vytvořit položku:", error);
      setError("Nepodařilo se vytvořit položku: " + error);
    }
  };

  const handleUpdateListItem = async (
    itemId: number,
    updatedContent: string,
    updatedIsComplete: boolean
  ) => {
    try {
      await updateListItem(itemId, updatedContent, updatedIsComplete);
      await loadListItems();
      setError(null);
    } catch (error) {
      console.error("Nepodařilo se aktualizovat položku:", error);
      setError("Nepodařilo se aktualizovat položku: " + error);
    }
  };

  const handleDeleteListItem = async (itemId: number) => {
    try {
      await deleteListItem(itemId);
      await loadListItems();
      setError(null);
    } catch (error) {
      console.error("Nepodařilo se smazat položku:", error);
      setError("Nepodařilo se smazat položku: " + error);
    }
  };

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setListItems((prevItems) => {
        const updatedItems = [...prevItems];
        const [removed] = updatedItems.splice(dragIndex, 1);
        updatedItems.splice(hoverIndex, 0, removed);
        const newItems = updatedItems.map((item, index) => ({
          ...item,
          position: index + 1,
        }));
        console.log(newItems);
        // Update positions in the database
        updateListItemPositions(
          newItems.map(({ id, position }) => ({ id, position }))
        ).catch((error) => {
          console.error("Error updating list item positions:", error);
          setError("Failed to update list item positions. Please try again.");
        });

        return newItems;
      });
    },
    [setListItems, setError]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-8">
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem href="/">Domů</BreadcrumbItem>
          <BreadcrumbItem href="/lists">Seznamy</BreadcrumbItem>
          <BreadcrumbItem>Položky</BreadcrumbItem>
        </Breadcrumbs>

        <h1 className={`${title()} mb-8`}>Položky seznamu</h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateListItem} className="flex gap-4 my-8">
          <Input
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            placeholder="Obsah nové položky"
            className="flex-grow"
          />
          <Button color="primary" type="submit" size="lg">
            Přidat položku
          </Button>
        </form>

        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="p-6">
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300"></div>
                </Skeleton>
              </Card>
            ))
        ) : (
          <div className="space-y-4">
            {listItems.map((item: ListItem, index: number) => (
              <DraggableListItem
                key={item.id}
                item={item}
                index={index}
                moveItem={moveItem}
                handleUpdateListItem={handleUpdateListItem}
                handleDeleteListItem={handleDeleteListItem}
                setEditingItem={setEditingItem}
                editingItem={editingItem}
              />
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
}
