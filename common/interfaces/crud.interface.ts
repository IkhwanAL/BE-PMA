export interface CRUD {
    create: (resource: any) => Promise<any>;
    readById: (id: number) => Promise<any>;
    deleteById: (id: number) => Promise<any>;
    patchById: (id: number, resource: any) => Promise<any>;
}
