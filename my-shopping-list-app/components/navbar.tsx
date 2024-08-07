"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";
import { Input } from "@nextui-org/input";
import { Kbd } from "@nextui-org/kbd";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { Link } from "@nextui-org/link";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";

import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";

export const Navbar = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalSearchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    lists: { id: number; name: string }[];
    items: { id: number; content: string; list_id: number }[];
  }>({ lists: [], items: [] });

  const [lists, setLists] = useState<{ id: number; name: string }[]>([]);
  const [items, setItems] = useState<
    { id: number; content: string; list_id: number }[]
  >([]);

  useEffect(() => {
    setLists(searchResults.lists || []);
    setItems(searchResults.items || []);
  }, [searchResults]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults({ lists: [], items: [] });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_URL}/api/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Search request failed");
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults({ lists: [], items: [] });
    }
  };

  const searchInput = (
    <Input
      ref={searchInputRef}
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Hledat..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );

  return (
    <>
      <NextUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-1"
              href="/"
            >
              <p className="font-bold text-inherit">Nákupní košík</p>
            </NextLink>
          </NavbarBrand>
          <NavbarItem>
            <NextLink href="/lists">Seznamy</NextLink>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>{searchInput}</NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
      </NextUINavbar>

      <Modal
        isOpen={lists?.length > 0 || items?.length > 0}
        onClose={() => {
          setSearchResults({ lists: [], items: [] });
          setSearchQuery("");
        }}
      >
        <ModalContent>
          <ModalHeader>Search Results</ModalHeader>
          <ModalBody>
            <Input
              ref={modalSearchInputRef}
              aria-label="Search in modal"
              placeholder="Continue searching..."
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {lists?.map((list) => (
              <div key={list.id}>
                <Link href={`/lists/${list.id}`}>{list.name} (Seznam)</Link>
              </div>
            ))}
            {items?.map((item) => (
              <div key={item.id}>
                <Link href={`/lists/${item.list_id}`}>
                  {item.content} (Položka)
                </Link>
              </div>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
