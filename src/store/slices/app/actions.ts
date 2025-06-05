import { setApplicationStatus } from "./application";


export const setIsRefreshingTrue = () => setApplicationStatus({ isRefreshing: true })
export const setIsConnectedTrue = () => setApplicationStatus({ isRefreshing: true })
export const setIsRefreshingFalse = () => setApplicationStatus({ isRefreshing: false })
export const setIsConnectedFalse = () => setApplicationStatus({ isRefreshing: false })