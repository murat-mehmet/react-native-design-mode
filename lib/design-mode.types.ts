export interface DesignModeProps {
    enabled?: boolean;
    prepare?: () => Promise<any>;
}

export interface DesignPageProps {
    title: string;
    prepare?: () => Promise<any>;
}
