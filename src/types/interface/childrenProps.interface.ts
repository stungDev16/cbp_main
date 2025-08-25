import type { FetchResponse } from "@/types/interface/hooks/useFetch.interface";
import type DefaultProps from "@/types/pages/defaultProps.interface";

export interface ChildrenPropsInterface
  extends DefaultProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FetchResponse<any> {}
