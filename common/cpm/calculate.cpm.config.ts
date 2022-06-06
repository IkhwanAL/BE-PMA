import { project, projectactivity, user, userteam } from '@prisma/client';
import { ifError } from 'assert';
import { Console } from 'console';
import moment from 'moment';

export interface CPM {
    es: number;
    ef: number;
    ls: number;
    lf: number;
    f: number;
    critical: boolean;
}
/**
 *
 */
export class CPM {
    private EndDate: Date;
    private readonly project: project & {
        projectactivity: projectactivity[];
        userteam: (userteam & {
            user: {
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
        [key: string]: projectactivity & {
            ParentActivity: { [key: string]: projectactivity };
            ChildActivity: { [key: string]: projectactivity };
        };
    } = {};

    private backwardParent: { [key: string]: Array<number | null> } = {};

    private LongestTime = 0;

    private forwardPassKeyOrder: number[] = [];

    constructor(
        data: project & {
            projectactivity: projectactivity[];
            userteam: (userteam & {
                user: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    email: string;
                    username: string;
                };
            })[];
        },
        date?: Date
    ) {
        this.project = data;
        this.EndDate = date;
    }

    public calculate() {
        if (this.project.projectactivity.length <= 2) {
            this.LongestTime = 0;
        } else {
            this.convert();
            this.Start();
        }
    }

    /**
     * * BIG O: N^2 (Quadratic Time)
     */
    private convert() {
        const ProjectActivityTemp = this.project.projectactivity;
        // Forward
        // N
        for (const iterator of ProjectActivityTemp) {
            this.forwardPassKeyOrder.push(iterator.projectActivityId);
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
         * * N^2
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

        // N
        for (const iterator in this.backwardParent) {
            this.convertResult[iterator].child =
                this.backwardParent[iterator].join(',');
        }
        /**
         * * N^2
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
    /**
     * * B
     */
    private Start() {
        const Act = this.convertResult;

        this.forwardPass(Act);

        const tempNumValue = [];

        // N
        for (const key in this.memoize) {
            tempNumValue.push(this.memoize[key].ef);
        }

        const highestKeyID = Math.max(...tempNumValue);

        this.LongestTime = highestKeyID;

        this.backwardPass(Act);

        this.calculateFloatPointActivity();
    }

    //#region Calculate Pass

    /**
     * * BIG 0: N^2 (Quadratic Time)
     * @param Act
     */
    private backwardPass(Act: {
        [key: string]: projectactivity & {
            ParentActivity: {
                [key: string]: projectactivity;
            };
            ChildActivity: {
                [key: string]: projectactivity;
            };
        };
    }) {
        const tempReverseObj = Act;
        // N
        const arrReverse = this.reverseObjAct(tempReverseObj) as Array<
            projectactivity & {
                ParentActivity: { [key: string]: projectactivity };
                ChildActivity: { [key: string]: projectactivity };
                key: string;
            }
        >;
        // N^2
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

    private SetEndDate(EndDate: Date, TimeToComplete: number) {
        this.EndDate = moment(EndDate).add(TimeToComplete, 'days').toDate();
    }

    /**
     * * BIG 0: N^2 (Quadratic Time)
     * @param Act
     */
    private forwardPass(Act: {
        [key: string]: projectactivity & {
            ParentActivity: {
                [key: string]: projectactivity;
            };
            ChildActivity: {
                [key: string]: projectactivity;
            };
        };
    }) {
        console.log(this.forwardPassKeyOrder);
        // N^2
        for (const currentId of this.forwardPassKeyOrder) {
            if (!this.memoize[currentId]) {
                this.memoize[currentId] = {} as CPM;
            }

            if (!Act[currentId].parent) {
                this.memoize[currentId].es = 0;
                this.memoize[currentId].ef = Act[currentId].timeToComplete + 0;
                continue;
            }

            if (Act[currentId].parent) {
                const PreviousId = Act[currentId].ParentActivity; // Yang Terhubung
                // console.log(currentId);
                // console.log(
                //     'Previous',
                //     Object.keys(PreviousId)[0],
                //     this.memoize
                // );
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
        const Test: {
            [key: string]: { Parent: string | number; Child: string | number };
        } = {};
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

        let FinishedCalculated = {};
        for (const it in this.memoize) {
            // console.log(Test);
            const Parent = this.convertResult[it].parent;
            // console.log(Parent, it);
            if (!Parent) {
                if (this.memoize[it].critical) {
                    this.EndDate = moment(this.EndDate)
                        .add(this.convertResult[it].timeToComplete, 'days')
                        .toDate();
                    // console.log(this.EndDate, it);
                }
                continue;
            }

            if (Parent) {
                const Split = Parent.split(',');

                if (Split.length <= 1) {
                    if (FinishedCalculated[Split[0]]) {
                        continue;
                    }
                    if (this.memoize[it].critical) {
                        this.EndDate = moment(this.EndDate)
                            .add(this.convertResult[it].timeToComplete, 'days')
                            .toDate();
                        // console.log(this.EndDate, it);
                    }

                    FinishedCalculated[Split[0]] = {
                        Parent: Split[0],
                        Child: it,
                    };
                }

                if (Split.length >= 2) {
                    if (this.memoize[it].critical) {
                        this.EndDate = moment(this.EndDate)
                            .add(this.convertResult[it].timeToComplete, 'days')
                            .toDate();
                        // console.log(this.EndDate, it);
                    }
                }
            }
        }
        // console.log(this.EndDate);
    }
    //#endregion

    //#region GetResult
    public getDeadLine(): number {
        return this.LongestTime;
    }

    public getCalculate() {
        return this.memoize;
    }

    public getDate() {
        return this.EndDate;
    }
    //#endregion

    //#region of Reverse Object
    /**
     * * BIG O: N
     * @param obj
     * @returns
     */
    private reverseObjAct: any = (obj: any) =>
        Object.keys(obj)
            .reverse()
            .map((key) => ({ ...obj[key], key: key }));
    //#endregion
}
