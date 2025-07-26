import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const client = new QueryClient({ defaultOptions:{ queries:{ retry:1, refetchOnWindowFocus:false, staleTime:30_000 } }});
export default function Providers({children}:PropsWithChildren){ return <QueryClientProvider client={client}>{children}</QueryClientProvider>; }