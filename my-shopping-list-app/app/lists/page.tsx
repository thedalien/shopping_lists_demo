"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { title } from "@/components/primitives";
import {
  Button,
  Input,
  Card,
  Skeleton,
  Breadcrumbs,
  BreadcrumbItem,
} from "@nextui-org/react";
import Link from "next/link";
import {
  fetchLists,
  createList,
  deleteList,
  updateList,
  updateListPositions,
  List,
} from "./(functions)/listApi";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface DraggableListItemProps {
  list: List;
  lists: List[];
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  handleUpdateList: (listId: number, updatedName: string) => Promise<void>;
  handleDeleteList: (listId: number) => Promise<void>;
  setEditingList: (list: List | null) => void;
  editingList: List | null;
}

const DraggableListItem = ({
  list,
  lists,
  index,
  moveItem,
  handleUpdateList,
  handleDeleteList,
  setEditingList,
  editingList,
}: DraggableListItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, drop] = useDrop({
    accept: "LIST_ITEM",
    hover(item: { index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "LIST_ITEM",
    item: () => ({ id: list.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-6">
        {editingList?.id === list.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateList(list.id, editingList.name);
            }}
            className="flex gap-4"
          >
            <Input
              value={editingList.name}
              onChange={(e) =>
                setEditingList({
                  ...editingList,
                  name: e.target.value,
                })
              }
              className="flex-grow"
            />
            <Button color="success" type="submit">
              Uložit
            </Button>
            <Button color="default" onClick={() => setEditingList(null)}>
              Zrušit
            </Button>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <Link
              href={`/lists/${list.id}`}
              className="text-xl hover:underline"
            >
              {list.name}
            </Link>
            <div className="flex gap-4">
              <Button color="primary" onClick={() => setEditingList(list)}>
                Upravit
              </Button>
              <Button color="danger" onClick={() => handleDeleteList(list.id)}>
                Smazat
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [newListName, setNewListName] = useState<string>("");
  const [editingList, setEditingList] = useState<List | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getLists();
  }, []);

  const getLists = async () => {
    try {
      setIsLoading(true);
      const fetchedLists = await fetchLists();
      setLists(fetchedLists);
      setErrorMessage(null);
    } catch (error) {
      console.error("Nepodařilo se načíst seznamy:", error);
      setErrorMessage("Nepodařilo se načíst seznamy. Zkuste to prosím znovu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const createdList = await createList(newListName);
      console.log(createdList);
      setLists((prevLists) => [...prevLists, createdList]);
      setNewListName("");
      setErrorMessage(null);
    } catch (error) {
      console.error("Nepodařilo se vytvořit seznam: ", error);
      setErrorMessage("Nepodařilo se vytvořit seznam: " + error);
    }
  };

  const handleUpdateList = async (listId: number, updatedName: string) => {
    try {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, name: updatedName } : list
        )
      );
      setEditingList(null);
      setErrorMessage(null);
      updateList(listId, updatedName).catch((error) => {
        console.error("Nepodařilo se aktualizovat seznam:", error);
        setErrorMessage("Nepodařilo se aktualizovat seznam: " + error);
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, name: list.name } : list
          )
        );
      });
    } catch (error) {
      console.error("Nepodařilo se aktualizovat seznam:", error);
      setErrorMessage("Nepodařilo se aktualizovat seznam: " + error);
    }
  };

  const handleDeleteList = async (listId: number) => {
    try {
      await deleteList(listId);
      setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
      setErrorMessage(null);
    } catch (error) {
      console.error("Nepodařilo se smazat seznam:", error);
      setErrorMessage("Nepodařilo se smazat seznam: " + error);
    }
  };

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setLists((prevLists) => {
        const updatedLists = [...prevLists];
        const [removed] = updatedLists.splice(dragIndex, 1);
        updatedLists.splice(hoverIndex, 0, removed);
        const newLists = updatedLists.map((list, index) => ({
          ...list,
          position: index + 1,
        }));
        console.log(newLists);
        // Update positions in the database
        updateListPositions(
          newLists.map(({ id, position }) => ({ id, position }))
        ).catch((error) => {
          console.error("Error updating list positions:", error);
          setErrorMessage("Failed to update list positions. Please try again.");
        });

        return newLists;
      });
    },
    [setLists, setErrorMessage]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-8">
        <Breadcrumbs className="mb-6">
          <BreadcrumbItem href="/">Domů</BreadcrumbItem>
          <BreadcrumbItem>Seznamy</BreadcrumbItem>
        </Breadcrumbs>

        <h1 className={`${title()} my-8`}>Seznamy</h1>

        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCreateList} className="flex gap-4 my-8">
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Název nového seznamu"
            className="flex-grow"
          />
          <Button color="primary" type="submit" size="lg">
            Přidat seznam
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-1/2 h-6 rounded-lg" />
                    <div className="flex gap-4">
                      <Skeleton className="w-24 h-10 rounded-lg" />
                      <Skeleton className="w-24 h-10 rounded-lg" />
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
        <div className="space-y-4">
          {lists.map((list, index) => (
            <DraggableListItem
              key={list.id}
              list={list}
              lists={lists}
              index={index}
              moveItem={moveItem}
              handleUpdateList={handleUpdateList}
              handleDeleteList={handleDeleteList}
              setEditingList={setEditingList}
              editingList={editingList}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
