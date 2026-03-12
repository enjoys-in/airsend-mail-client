"use client"
import { AccountSwitcher } from "@/components/account/account-switcher";
import { cn, formatBytes } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import React from "react";
import { useDispatch } from "react-redux";
import { Separator } from "../ui/separator";
import { Button, buttonVariants } from "../ui/button";
import { ComposeEmailDrawerSheet } from "../compose-email-sheet-dialog";
import NavList from "./nav-list";

import {
  Check,
  ChevronUp,
  EllipsisVertical,
  File,
  Folder,
  Inbox,
  Plus,
  Send,
  Tag,
  Trash,
  X,
} from "lucide-react";
import { createLabel, Label as ILabel } from "@/store/slices/labels";
import { createFolder, Folder as IFolder } from "@/store/slices/folders";
import { Input } from "../ui/input";
import RootTab from "../RootTab";
import { setSidebarTab } from "@/store/slices/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MAIL_LINKS, PREFERENCE_LINKS } from "@/constants/links";
import DisplayLeftSidebarCard from "../common/displayCard";
import { CustomDialog } from "../common/CustomDialog";
import StorageCard, { LinearProgressBar } from "../shared/cards/StorageCard";
import { ScrollArea } from "../ui/scroll-area";
import AccountSwitcher2 from "../account/account-switcher2";

const LeftSidebar = () => {
  const labels = useAppSelector((state) => (state.labels.labels));
  const folders = useAppSelector((state) => state.folders.folders);
  const sidebarTab = useAppSelector((state) => state.layout.sidebarTab);
  const currAccount = useAppSelector((state) => state.accounts.currAccount);

  const dispatch = useDispatch();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <aside className="md:flex-none flex flex-col justify-between self-stretch md:m-6 w-[200px]">

      <div>
        <div
          className={cn(
            "flex h-[52px] items-center justify-center mb-4 w-[200px]"
          )}
        >
          <AccountSwitcher2 />
        </div>
        {/* {currAccount?.role === "USER" &&
          <div className="hidden md:block">
            <RootTab<"Mailbox" | "Workspace">
              activeTab={sidebarTab}
              changeTab={(newTab) => {
                dispatch(setSidebarTab(newTab));
                router.push(newTab === "Mailbox" ? "/u" : "/u/workspace/"+currAccount?.tenant_name);
              }}
              leftLabel="Mailbox"
              rightLabel="Workspace"
            />
          </div>
        } */}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {(isMobile || sidebarTab === "Mailbox") && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <NavList links={MAIL_LINKS} />
              <Separator />
              <ScrollArea className="h-56">
                <Collections
                  type="folders"
                  collections={folders}
                  createCollection={(foo) => dispatch(createFolder(foo as IFolder))}
                />
                <Separator className="my-1" />
                <Collections
                  type="labels"
                  collections={labels}
                  createCollection={(foo) => dispatch(createLabel(foo as ILabel))}
                />
              </ScrollArea>
            </div>
            <div className="justify-self-end">
              <Storage used={0} total={10000000} color={"pink"} />

              <ComposeEmailDrawerSheet>
                <div
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "bg-[#5a61ff] hover:bg-[#5a61ffaa] text-white w-full mt-6 rounded-none cursor-pointer"
                  )}
                >
                  Compose
                </div>
              </ComposeEmailDrawerSheet>
            </div>
            {/* <DisplayLeftSidebarCard /> */}
          </div>
        )}

      </div>

    </aside>

  );
};

export default LeftSidebar;

const Collections = ({
  collections,
  createCollection,
  type,
}: {
  collections: (IFolder | ILabel)[];
  createCollection: (foo: IFolder | ILabel) => void;
  type: "folders" | "labels";
}) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newCollectionName, setNewCollectionName] = React.useState(
    type === "folders" ? "New Folder" : "New Label"
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCreateCollection = () => {
    if (type === "folders")
      createCollection({
        id: Math.ceil(Math.random() * 1000),
        name: newCollectionName,
      });
    if (type === "labels")
      createCollection({
        id: Math.ceil(Math.random() * 1000),
        name: newCollectionName,
        color: "blue",
      });
    setIsCreating(false);
    setNewCollectionName(type === "folders" ? "New Folder" : "New Label");
  };
  const handleCancelCreateCollection = () => {
    setIsCreating(false);
    setNewCollectionName(type === "folders" ? "New Folder" : "New Label");
  };
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue={"item-1"}
      onValueChange={(item) => setIsOpen(item === "item-1")}
    >
      <AccordionItem value="item-1">
        <div className="flex ">
          <AccordionTrigger className="w-full">
            <div className="my-2 w-full">
              <div className="text-zinc-500 text-xs flex flex-row justify-between items-center gap-2">
                <span className="flex flex-row gap-2 items-center text-blue-400">
                  {type === "folders" ? "Folders" : "Labels"}
                  <ChevronUp
                    size={16}
                    className={`rotate-${isOpen ? 0 : 180} hover:rotate-${!isOpen ? 0 : 180} transition-transform duration-300`}
                  />
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <div className="flex flex-row items-center">
            {isOpen &&
              (isCreating ? (
                <Button
                  className="p-2   text-red-500 hover:bg-zinc-700 rounded-none"
                  variant={"ghost"}
                  onClick={() => setIsCreating(false)}
                >
                  <X size={16} />
                </Button>
              ) : (
                <Button
                  className="p-2 rounded-none hover:bg-zinc-700"
                  variant={"ghost"}
                  onClick={() => {
                    setIsCreating(true);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }}
                >
                  <Plus size={16} />
                </Button>
              ))}
            <Button variant={"ghost"} className="p-2">
              <EllipsisVertical size={16} />
            </Button>
          </div>
        </div>
        <AccordionContent>
          <div
            className={cn(
              `flex-row items-start`,
              isCreating ? "flex" : "hidden"
            )}
          >
            <Input
              ref={inputRef}
              className="rounded-md text-zinc-500 focus:outline-none h-full"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCollection();
                else if (e.key === "Escape") handleCancelCreateCollection();
              }}
            />
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={handleCreateCollection}
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-col text-zinc-500">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "justify-between px-2 my-0"
                )}
              >
                <div className="flex flex-row gap-4 text-zinc-500 cursor-pointer">
                  {"color" in collection && collection.color && (
                    <div className={cn("text-" + collection.color + "-500")}>
                      <Tag size={16} />
                    </div>
                  )}
                  <div>{collection.name}</div>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const Storage = ({
  color,
  total,
  used,
}: {
  used: number;
  total: number;
  color: string;
}) => {
  const percent = Math.round((used / total) * 100);

  return (
    <div className="flex flex-col cursor-default mt-2">
      <div className="flex flex-row gap-2 items-center">
        <Folder size={10} />
        <div>
          <span className={cn(`text-xs font-bold `, percent < 80 ? `text-blue-500 dark:text-zinc-50` : "text-red-600 dark:text-red-500")}>
            {formatBytes(used)}
          </span>
          <span className="text-xs text-zinc-400"> / {formatBytes(total)}</span>
        </div>
        <CustomDialog triggerComponent={<span className="text-xs text-orange-500 cursor-pointer">View</span>}>
          <StorageCard used={used} total={total} />
        </CustomDialog>
      </div>
      <div className="h-[4px] mt-1 flex w-full items-center rounded-full bg-zinc-300 dark:bg-zinc-300">
        <LinearProgressBar progress={percent} width={250} />
      </div>
    </div>
  );
};
