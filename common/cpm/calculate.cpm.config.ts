import { Project, ProjectActivity, UserTeam } from '@prisma/client';
import { ProjectCpm } from '../types/cpm.types';

export interface CPM {
    es: number;
    ef: number;
    ls: number;
    lf: number;
    f: number;
}

export class CPM {
    private project: Project & {
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
            DataActivity: { [key: string]: ProjectActivity };
        };
    } = {};

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
    }

    private convert() {
        const ProjectActivityTemp = this.project.ProjectActivity;

        for (const iterator of ProjectActivityTemp) {
            // this.convertResult[].
            this.convertResult[iterator.projectActivityId] = {
                ...iterator,
                DataActivity: {},
            };
        }

        for (const key in this.convertResult) {
            if (!this.convertResult[key].parent) {
                continue;
            }
            const split = this.convertResult[key].parent.split(',');

            const temp = {};

            for (const iterator of split) {
                const find = this.convertResult[iterator];

                temp[iterator] = find;
            }

            this.convertResult[key].DataActivity = temp;
        }
    }

    private Start() {
        const Act = this.convertResult;

        /**
         * Key Current
         */
        for (const currentId in Act) {
            if (!this.memoize[currentId]) {
                this.memoize[currentId] = {} as CPM;
            }
            if (!Act[currentId].parent) {
                this.memoize[currentId].es = 0;
                this.memoize[currentId].ef = Act[currentId].timeToComplete + 0;
            }

            if (Act[currentId].parent) {
                const PreviousId = Act[currentId].DataActivity; // Yang Terhubung

                if (Object.keys(PreviousId).length <= 1) {
                    console.log(PreviousId, 'Preview');
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
        const tempNumValue = [];

        for (const key in this.memoize) {
            tempNumValue.push(parseInt(key));
        }

        const highestKeyID = Math.max(...tempNumValue);

        this.LongestTime = this.memoize[highestKeyID].ef;
    }

    public getDeadLine(): number {
        return this.LongestTime;
    }

    private End() {}
}
