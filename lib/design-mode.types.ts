import {PropsWithChildren} from "react";

export interface DesignModeProps extends PropsWithChildren<any>{
    enabled?: boolean;
    prepare?: () => Promise<any>;
}

export interface DesignPageProps extends PropsWithChildren<any>{
    title: string;
    prepare?: () => Promise<any>;
}
