export enum SocketEventConstants {

  WARNING = "@@WARNING",
  ERROR = "@@ERROR",
  INFO = "@@INFO",
  OFFER = "@@OFFER",
  BANNED = "@@BANNED",

  ServerClosed = "@@ServerClosed",
  ServerStarted = "@@ServerStarted",

  REGISTER_CLIENT = "@@REGISTER_CLIENT",
  NEW_MAIL_RECEIVED = "@@NEW_MAIL_RECEIVED",
  DELIVERED = "@@DELIVERED",
  REJECTED = "@@REJECTED",
  MAIL_USAGED = "@@MAIL_USAGE",
  SENT_MAIL = "@@SENT_MAIL",


}
export enum SOCKET_ROOMS {
  GLOBAL = "GLOBAL::SEND:MAILBOX",
  USER_ROOM = "USER_ROOM::"
}



