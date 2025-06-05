import React, { useState } from "react";
import { FaPaperclip, FaStar } from "react-icons/fa";

interface IInboxMsg {
  from: string;
  hasAttachment: boolean;
  isRead: boolean;
  isStarred: boolean;
  timestamp: string;
  title: string;
  contents: string;
}
function Inbox({ data }: { data: IInboxMsg[] }) {
  return (
    <div className="h-full flex flex-col">
      <ul className="flex-1 overflow-auto">
        {data.map((msg, i) => (
          <InboxItem key={i} {...msg} />
        ))}
      </ul>
    </div>
  );
}

export default Inbox;

const InboxItem = ({
  from,
  hasAttachment,
  isRead,
  isStarred,
  timestamp,
  title,
  contents,
}: IInboxMsg) => {
  return (
    <li className="flex flex-row px-6 py-4 border-b-[1px] border-black">
      <div className="flex flex-col flex-1">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2 items-center">
            <p className="text-sm">{from}</p>
            {hasAttachment && (
              <span className="text-zinc-500">
                <FaPaperclip />
              </span>
            )}
            {!isRead && (
              <div className="w-2 h-2 bg-red-500 rounded-full"> </div>
            )}
          </div>
        </div>
        <p className="mt-2">{title}</p>
        <p className="mt-2 text-zinc-500 text-sm line-clamp-2">{contents}</p>
      </div>
      <div className="flex flex-col justify-between items-end">
        <div className="text-sm text-zinc-500">{timestamp}</div>
        <span className={`${isStarred ? "text-yellow-500" : "text-zinc-800"}`}>
          <FaStar />
        </span>
      </div>
    </li>
  );
};
