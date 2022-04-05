import { Project, ProjectActivity, UserTeam } from '@prisma/client';

export interface CPM {
    es: number;
    ef: number;
    ls: number;
    lf: number;
    f: number;
    critical: boolean;
}

export class CPM {
    private readonly project: Project & {
        ProjectActivity: ProjectActivity[];
        UserTeam: (UserTeam & {
            User: {
                id: number;
                firstName: string;
                lastName: string;
                email: string;
                username: string;
            };
        })[];
    };
    private memoize: { [key: string]: CPM } = {};

    private convertResult: {
        [key: string]: ProjectActivity & {
            ParentActivity: { [key: string]: ProjectActivity };
            ChildActivity: { [key: string]: ProjectActivity };
        };
    } = {};

    private backwardParent: { [key: string]: Array<number | null> } = {};

    private LongestTime = 0;

    constructor(
        data: Project & {
            ProjectActivity: ProjectActivity[];
            UserTeam: (UserTeam & {
                User: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    username: string;
                };
            })[];
        }
    ) {
        this.project = data;
    }

    public calculate() {
        if (this.project.ProjectActivity.length <= 2) {
            return 0;
        }
        this.convert();
        this.Start();

        console.log(this.memoize);
    }

    private convert() {
        const ProjectActivityTemp = this.project.ProjectActivity;

        for (const iterator of ProjectActivityTemp) {
            // this.convertResult[].
            this.convertResult[iterator.projectActivityId] = {
                ...iterator,
                ParentActivity: {},
                ChildActivity: {},
            };
            if (!this.backwardParent[iterator.projectActivityId.toString()]) {
                this.backwardParent[iterator.projectActivityId.toString()] = [];
            }
        }
        /**
         * * Mencari Parent Node
         * * Dan Mencari Vertex Child
         */
        for (const key in this.convertResult) {
            if (!this.convertResult[key].parent) {
                continue;
            }

            const split = this.convertResult[key].parent.split(',');

            const temp = {};

            for (const iterator of split) {
                const find = this.convertResult[iterator];

                temp[iterator] = find;

                if (this.backwardParent[iterator]) {
                    this.backwardParent[iterator].push(parseInt(key));
                }
            }

            this.convertResult[key].ParentActivity = temp;
        }

        for (const iterator in this.backwardParent) {
            this.convertResult[iterator].child =
                this.backwardParent[iterator].join(',');
        }
        /**
         * * Mencari Child Node
         */
        for (const key in this.convertResult) {
            if (!this.convertResult[key].child) {
                continue;
            }

            const split = this.convertResult[key].child.split(',');

            const temp = {};

            for (const iterator of split) {
                const find = this.convertResult[iterator];

                temp[iterator] = find;
            }

            this.convertResult[key].ChildActivity = temp;
        }
    }

    private Start() {
        const Act = this.convertResult;

        this.forwardPass(Act);

        const tempNumValue = [];

        for (const key in this.memoize) {
            tempNumValue.push(this.memoize[key].ef);
        }

        const highestKeyID = Math.max(...tempNumValue);

        this.LongestTime = highestKeyID;

        this.backwardPass(Act);

        this.calculateFloatPointActivity();
    }

    private backwardPass(Act: {
        [key: string]: ProjectActivity & {
            ParentActivity: {
                [key: string]: ProjectActivity;
            };
            ChildActivity: {
                [key: string]: ProjectActivity;
            };
        };
    }) {
        const tempReverseObj = Act;

        const arrReverse = this.reverseObjAct(tempReverseObj) as Array<
            ProjectActivity & {
                ParentActivity: { [key: string]: ProjectActivity };
                ChildActivity: { [key: string]: ProjectActivity };
                key: string;
            }
        >;

        for (const currentId of arrReverse) {
            if (!Act[currentId.key].child) {
                this.memoize[currentId.key].lf = this.LongestTime;
                this.memoize[currentId.key].ls =
                    this.LongestTime - Act[currentId.key].timeToComplete;
            }

            if (this.convertResult[currentId.key].child) {
                const PreviousId = Act[currentId.key].ChildActivity;

                if (Object.keys(PreviousId).length <= 1) {
                    this.memoize[currentId.key].lf =
                        this.memoize[
                            PreviousId[
                                Object.keys(PreviousId)[0]
                            ].projectActivityId
                        ].ls;
                    this.memoize[currentId.key].ls =
                        this.memoize[currentId.key].lf -
                        Act[currentId.key].timeToComplete;
                }

                if (Object.keys(PreviousId).length >= 2) {
                    const GetLSValue: Array<number> = [];

                    for (const key in PreviousId) {
                        const num = this.memoize[key].ls;
                        GetLSValue.push(num);
                    }

                    this.memoize[currentId.key].lf = Math.min(...GetLSValue);
                    this.memoize[currentId.key].ls =
                        this.memoize[currentId.key].lf -
                        Act[currentId.key].timeToComplete;
                }
            }
        }
    }

    private forwardPass(Act: {
        [key: string]: ProjectActivity & {
            ParentActivity: {
                [key: string]: ProjectActivity;
            };
            ChildActivity: {
                [key: string]: ProjectActivity;
            };
        };
    }) {
        for (const currentId in Act) {
            if (!this.memoize[currentId]) {
                this.memoize[currentId] = {} as CPM;
            }
            if (!Act[currentId].parent) {
                this.memoize[currentId].es = 0;
                this.memoize[currentId].ef = Act[currentId].timeToComplete + 0;
            }

            if (Act[currentId].parent) {
                const PreviousId = Act[currentId].ParentActivity; // Yang Terhubung

                if (Object.keys(PreviousId).length <= 1) {
                    this.memoize[currentId].es =
                        this.memoize[
                            PreviousId[
                                Object.keys(PreviousId)[0]
                            ].projectActivityId
                        ].ef;
                    this.memoize[currentId].ef =
                        this.memoize[currentId].es +
                        Act[currentId].timeToComplete;
                }

                if (Object.keys(PreviousId).length >= 2) {
                    const GetEFValue: Array<number> = [];

                    for (const key in PreviousId) {
                        const num = this.memoize[key].ef;
                        GetEFValue.push(num);
                    }

                    this.memoize[currentId].es = Math.max(...GetEFValue);
                    this.memoize[currentId].ef =
                        this.memoize[currentId].es +
                        Act[currentId].timeToComplete;
                }
            }
        }
    }

    private calculateFloatPointActivity() {
        for (const iterator in this.memoize) {
            const ef = this.memoize[iterator].ef;
            const es = this.memoize[iterator].es;
            const ls = this.memoize[iterator].ls;
            const lf = this.memoize[iterator].lf;

            if (lf - ef === 0) {
                this.memoize[iterator].f = lf - ef;
                this.memoize[iterator].critical = true;
            } else if (ls - es === 0) {
                this.memoize[iterator].f = ls - es;
                this.memoize[iterator].critical = true;
            } else if (lf - ef < 0) {
                this.memoize[iterator].f = ls - es;
                this.memoize[iterator].critical = false;
            } else {
                this.memoize[iterator].f = lf - ef;
                this.memoize[iterator].critical = false;
            }
        }
    }

    public getDeadLine(): number {
        return this.LongestTime;
    }

    public getCalculate() {
        return this.memoize;
    }

    private reverseObjAct: any = (obj: any) =>
        Object.keys(obj)
            .reverse()
            .map((key) => ({ ...obj[key], key: key }));
}
