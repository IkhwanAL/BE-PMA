import { project, projectactivity, userteam } from '@prisma/client';

import moment, { Moment } from 'moment';

export interface ICPM {
    es: number;
    ef: number;
    ls: number;
    lf: number;
    f: number;
    critical: boolean;
    date: Date;
    status: string;
}
/**
 * * Using Graph With Memoize
 * * Using Memoize To Memory The Result
 */
export class CPM {
    private EndDate: Date;
    private Stop = false;
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
    /**
     * * Memoize Variable That Activity Is Already Calculated
     */
    private memoize: { [key: string]: ICPM } = {};

    private convertResult: {
        [key: string]: projectactivity & {
            ParentActivity: { [key: string]: projectactivity };
            ChildActivity: { [key: string]: projectactivity };
        };
    } = {};

    private backwardParent: { [key: string]: Array<number | null> } = {};

    private LongestTime = 0;

    private forwardPassKeyOrder: number[] = [];

    private Graph: Map<
        string,
        projectactivity & {
            ParentActivity: {
                [key: string]: projectactivity;
            };
            ChildActivity: {
                [key: string]: projectactivity;
            };
        }
    >;

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
            this.SortActivity();
            /**
             * * Preventing From Start If Something Error
             * * Without Causing Caught Exception
             */
            if (this.Stop) {
                return;
            }
            this.Start();
        }
    }

    /**
     * * BIG O: N^2 (Quadratic Time)
     * * The Purpose Of This Function Is To Find The Relation Or Dependencies Of Each Data from Activity; Parent And Child Node
     */
    private convert() {
        const ProjectActivityTemp = this.project.projectactivity;

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
     * * A Funtion That Start A Calculation
     */
    private Start() {
        try {
            /**
             * * Referencing Variable
             */
            const Act = this.convertResult;
            /**
             * * Forward Pass
             */
            this.forwardPass(Act);
            /**
             * * Temp Value For EF Value For Every Activity
             */
            const tempNumValue = [];

            // N
            for (const key in this.memoize) {
                tempNumValue.push(this.memoize[key].ef);
            }

            /**
             * * Find The Hihgest Value to Set The Deadline
             */
            const highestKeyID = Math.max(...tempNumValue);

            /**
             * * Put IT Inside Class Properties
             */
            this.LongestTime = highestKeyID;

            /**
             * * Backward Pass
             */
            this.backwardPass(Act);

            /**
             * * Finding Float Point, Critical Point And Deadline Date
             */
            this.calculateFloatPointActivity();
        } catch (error) {
            this.Stop = true;
            return;
        }
    }

    /**
     * Sorting Activity
     * Following A Concept Of Graph
     * And Using Map So The Value Won`t Be Sorted By Javascript
     */
    private SortActivity = () => {
        /**
         * * References Variable
         */
        const PRACT = this.convertResult;
        /**
         * * Create A New Node Graph Or A Head
         */
        const NodeTree = new Map<
            string,
            projectactivity & {
                ParentActivity: {
                    [key: string]: projectactivity;
                };
                ChildActivity: {
                    [key: string]: projectactivity;
                };
            }
        >();
        let TotalWithParent = 0;
        let TotalWithChild = 0;
        let NoDependencies = 0;
        /**
         * * For Every Activity Where No Parent At All
         * * Will Automatically Set The Node Of Graph
         */
        for (const key in PRACT) {
            const par = Object.keys(PRACT[key].ParentActivity).length;
            const child = Object.keys(PRACT[key].ChildActivity).length;

            if (par === 0 && child !== 0) {
                NodeTree.set(key, PRACT[key]);
                TotalWithParent++;
            }
        }

        for (const key in PRACT) {
            const par = Object.keys(PRACT[key].ParentActivity).length;
            const child = Object.keys(PRACT[key].ChildActivity).length;

            if (child === 0 && par !== 0) {
                NodeTree.set(key, PRACT[key]);
                TotalWithChild++;
            }
        }

        for (const key in PRACT) {
            const par = Object.keys(PRACT[key].ParentActivity).length;
            const child = Object.keys(PRACT[key].ChildActivity).length;

            if (par === 0 && child === 0) {
                NodeTree.set(key, PRACT[key]);
                NoDependencies++;
            }
        }

        /**
         * * If There No First Parent Or Last Child On Every Activity
         * * System Cannot Calculated It
         * * The Reason is To Prevent From Infinite Loop
         * * Can Cause Error StackOverflow
         */
        if (TotalWithParent === 0 || TotalWithChild === 0) {
            this.Stop = true;
            return;
        }

        /**
         * * Traverse The Graph
         */
        for (const [key, _value] of NodeTree) {
            /**
             * * in Every Graph Loop The Activity
             */
            for (const iterator in PRACT) {
                if (!PRACT[iterator].parent) {
                    continue;
                }

                /**
                 * * Finding Parent Of It
                 */
                const FindParent = PRACT[iterator].parent.split(',');

                /**
                 * * Make Sure The Parent Or Dependencies Is Exist With Graph
                 */
                const isThereAParent = FindParent.find((x) => x == key);

                /**
                 * * If Parent Exist
                 * * Set THe Value To Graph
                 */
                if (isThereAParent) {
                    NodeTree.set(iterator, PRACT[iterator]);
                }
            }
            // What If There`s No Dependencies
        }
        /**
         * * Assign To Class Properties Graph
         */
        this.Graph = NodeTree;
    };

    //#region Calculate Pass

    /**
     * * BIG 0: N^2 (Quadratic Time)
     * @param Act
     */
    private backwardPass(
        Act:
            | {
                  [key: string]: projectactivity & {
                      ParentActivity: {
                          [key: string]: projectactivity;
                      };
                      ChildActivity: {
                          [key: string]: projectactivity;
                      };
                  };
              }
            | (projectactivity & {
                  ParentActivity: {
                      [key: string]: projectactivity;
                  };
                  ChildActivity: {
                      [key: string]: projectactivity;
                  };
              }),
        Stop = false,
        keyActivy?: string
    ) {
        // try {
        /**
         * * Used For Stopping From Infinite Lopp
         */
        if (Stop) {
            return;
        }

        /**
         * * If Paramater keyActivity is Exists
         * * Do Command Below
         */
        if (keyActivy) {
            /**
             * * If There`s No Child From Param Or From Class Properties
             * * It Mean The Activity Is Located At The Back
             * * A Starting Poing For BackwardPass
             */
            if (!this.Graph.get(keyActivy).child) {
                /**
                 * * Set Memoise Value With New lf Properties with Longest Time
                 */
                this.memoize[keyActivy].lf = this.LongestTime;

                /**
                 * * Set Memoize Value With New ls Value With
                 * * LS = LF - Time To Complete
                 */
                this.memoize[keyActivy].ls =
                    this.LongestTime - this.Graph.get(keyActivy).timeToComplete;
                this.memoize[keyActivy].status = 'END';
            }
            /**
             * * If Child Is Exist From Activity
             * * Check
             */
            if (this.convertResult[keyActivy].child) {
                /**
                 * * Get The Value First
                 */
                const PreviousId = this.Graph.get(keyActivy).ChildActivity;

                /**
                 * * Check The Length Of Previous Value That Been Recently Get
                 */
                if (Object.keys(PreviousId).length <= 1) {
                    const LFCHeck =
                        this.memoize[
                            PreviousId[Object.keys(PreviousId)[0]]
                                .projectActivityId
                        ]?.lf;

                    if (!LFCHeck) {
                        /**
                         * * Do The Recusion To Find The Value
                         * ! Do With Caution
                         */
                        this.backwardPass(
                            Act,
                            false,
                            '' +
                                PreviousId[Object.keys(PreviousId)[0]]
                                    .projectActivityId
                        );
                    }

                    /**
                     * * Calculated THe Value Of LF With The Child Value Of LS
                     * * LF = LS
                     */
                    this.memoize[keyActivy].lf =
                        this.memoize[
                            PreviousId[
                                Object.keys(PreviousId)[0]
                            ].projectActivityId
                        ].ls;
                    /**
                     * * Calculated The Value OF LS With Current LF
                     * * LS = LF - Time To Completed
                     */
                    this.memoize[keyActivy].ls =
                        this.memoize[keyActivy].lf -
                        this.Graph.get(keyActivy).timeToComplete;
                }

                /**
                 * * If The Child For Activity Is More Than 2
                 * * Check
                 */
                if (Object.keys(PreviousId).length >= 2) {
                    /**
                     * * Set An Empty Value For Finding LF Value From Previous Activity
                     */
                    const GetLSValue: Array<number> = [];

                    /**
                     * * Traverse The Previous Value
                     */
                    for (const key in PreviousId) {
                        /**
                         * * Get The Ls
                         */
                        const num = this.memoize[key]?.ls;

                        /**
                         * * If LS isn`t Exist
                         */
                        if (!num) {
                            /**
                             * * Do A Recursion
                             * ! Can Cause Infinite Loop
                             * ! Do With Caution
                             * ! Recommended Using Debugger
                             * * The Recursion is For Calculate Previous Node
                             * * if The LS Value Isn`t Exist
                             */
                            this.backwardPass(Act, false, key);
                            /**
                             * * After Calculation
                             * * Get The Value
                             */
                            const nums = this.memoize[key].ls;
                            /**
                             * * Store It to Array
                             */
                            GetLSValue.push(nums);
                        }
                        /**
                         * * If Value LS is Exist Then
                         * * Instant Push
                         */
                        if (num) {
                            this.backwardPass(Act, true);
                            GetLSValue.push(num);
                        }
                    }

                    /**
                     * * Finding The Minimal For Every Pushed Value
                     */
                    this.memoize[keyActivy].lf = Math.min(...GetLSValue);
                    /**
                     * * Calculated The LS Value With
                     * * LS = LF - TIme To Completed
                     */
                    this.memoize[keyActivy].ls =
                        this.memoize[keyActivy].lf -
                        this.Graph.get(keyActivy).timeToComplete;
                }
            }
        }

        /**
         * * Reverse The Value Of Class Properties Tree
         */
        const arrReverse = new Map(Array.from(this.Graph).reverse());

        /**
         * * N^2
         * * Loop On Every Activity From arrReverse
         */
        for (const [currentId, _values] of arrReverse) {
            if (!this.Graph.get(currentId).child) {
                this.memoize[currentId].lf = this.LongestTime;
                this.memoize[currentId].ls =
                    this.LongestTime - this.Graph.get(currentId).timeToComplete;
                this.memoize[currentId].status = 'END';
            }

            if (this.convertResult[currentId].child) {
                const PreviousId = Act[currentId].ChildActivity;

                if (Object.keys(PreviousId).length <= 1) {
                    const LFCHeck =
                        this.memoize[
                            PreviousId[Object.keys(PreviousId)[0]]
                                .projectActivityId
                            // .projectActivity
                        ]?.lf;

                    if (!LFCHeck) {
                        /**
                         * * Do The Recusion To Find The Value
                         * ! Do With Caution
                         */
                        this.backwardPass(
                            Act,
                            false,
                            '' +
                                PreviousId[Object.keys(PreviousId)[0]]
                                    .projectActivityId
                        );
                    }

                    this.memoize[currentId].lf =
                        this.memoize[
                            PreviousId[
                                Object.keys(PreviousId)[0]
                            ].projectActivityId
                        ].ls;
                    this.memoize[currentId].ls =
                        this.memoize[currentId].lf -
                        Act[currentId].timeToComplete;
                }

                if (Object.keys(PreviousId).length >= 2) {
                    const GetLSValue: Array<number> = [];

                    for (const key in PreviousId) {
                        const num = this.memoize[key]?.ls;

                        if (!num) {
                            this.backwardPass(Act, false, key);
                            const nums = this.memoize[key].ls;
                            GetLSValue.push(nums);
                        }
                        if (num) {
                            GetLSValue.push(num);
                        }
                    }

                    this.memoize[currentId].lf = Math.min(...GetLSValue);
                    this.memoize[currentId].ls =
                        this.memoize[currentId].lf -
                        Act[currentId].timeToComplete;
                }
            }
        }

        return;
    }

    /**
     * * BIG 0: N^2 (Quadratic Time)
     * * Finding ES And EF Using Forward Pass
     */
    private forwardPass(
        Act:
            | {
                  [key: string]: projectactivity & {
                      ParentActivity: {
                          [key: string]: projectactivity;
                      };
                      ChildActivity: {
                          [key: string]: projectactivity;
                      };
                  };
              }
            | (projectactivity & {
                  ParentActivity: {
                      [key: string]: projectactivity;
                  };
                  ChildActivity: {
                      [key: string]: projectactivity;
                  };
              }),
        Stop = false,
        keyActivy?: string // it mean can be undefined
    ) {
        if (Stop) {
            return;
        }
        // N^2
        try {
            if (keyActivy) {
                const keyAct = keyActivy;
                if (!this.memoize[keyAct]) {
                    this.memoize[keyAct] = {} as ICPM;
                }

                if (!this.Graph.get(keyAct).parent) {
                    const val = this.Graph.get(keyAct).timeToComplete;
                    this.memoize[keyAct].es = 0;
                    this.memoize[keyAct].ef =
                        this.Graph.get(keyAct).timeToComplete + 0;
                    this.memoize[keyAct].date = moment(this.EndDate)
                        .add(val, 'days')
                        .toDate();
                    this.memoize[keyAct].status = 'START';
                    return;
                }

                if (this.Graph.get(keyAct).parent) {
                    const PreviousId = this.Graph.get(keyAct).ParentActivity; // Yang Terhubung
                    if (Object.keys(PreviousId).length <= 1) {
                        const ID =
                            PreviousId[Object.keys(PreviousId)[0]]
                                .projectActivityId;
                        const EFCHeck =
                            this.memoize[
                                PreviousId[Object.keys(PreviousId)[0]]
                                    .projectActivityId
                                // .projectActivity
                            ]?.ef;

                        if (!EFCHeck) {
                            /**
                             * * Do The Recusion To Find The Value
                             * ! Do With Caution
                             */
                            this.forwardPass(
                                Act,
                                false,
                                '' +
                                    PreviousId[Object.keys(PreviousId)[0]]
                                        .projectActivityId
                            );
                        }

                        this.memoize[keyAct].es =
                            this.memoize[
                                PreviousId[
                                    Object.keys(PreviousId)[0]
                                ].projectActivityId
                            ].ef;
                        this.memoize[keyAct].ef =
                            this.memoize[keyAct].es +
                            this.Graph.get(keyAct).timeToComplete;

                        this.memoize[keyAct].date = moment(
                            this.memoize[ID].date
                        )
                            .add(this.Graph.get('' + ID).timeToComplete, 'days')
                            .toDate();
                        this.memoize[keyAct].status = 'GOING';
                    }

                    if (Object.keys(PreviousId).length >= 2) {
                        const GetEFValue: Array<number> = [];
                        const GetDateValues: Moment[] = [];

                        for (const key in PreviousId) {
                            const num = this.memoize[key]?.ef;
                            const dates = this.memoize[key]?.date;

                            if (!num) {
                                this.forwardPass(Act, false, key);
                                const nums = this.memoize[key].ef;
                                const dates = this.memoize[key]?.date;
                                GetEFValue.push(nums);
                                GetDateValues.push(moment(dates));
                            }

                            if (num) {
                                this.forwardPass(Act, true);
                                GetEFValue.push(num);
                                GetDateValues.push(moment(dates));
                            }
                        }
                        // if (GetEFValue.length >= 2) {
                        this.memoize[keyAct].es = Math.max(...GetEFValue);
                        this.memoize[keyAct].ef =
                            this.memoize[keyAct].es +
                            this.Graph.get(keyAct).timeToComplete;

                        this.memoize[keyAct].date = moment
                            .max(GetDateValues)
                            .add(this.Graph.get(keyAct).timeToComplete, 'days')
                            .toDate();
                        this.memoize[keyAct].status = 'GOING';
                    }
                }

                return;
            }

            for (const [currentId, _values] of this.Graph) {
                if (!this.memoize[currentId]) {
                    this.memoize[currentId] = {} as ICPM;
                }
                if (
                    !this.Graph.get(currentId).parent &&
                    Object.keys(this.memoize[currentId]).length === 0
                ) {
                    const val = this.Graph.get(currentId).timeToComplete;
                    this.memoize[currentId].es = 0;
                    this.memoize[currentId].ef =
                        this.Graph.get(currentId).timeToComplete + 0;
                    this.memoize[currentId].date = moment(this.EndDate)
                        .add(val, 'days')
                        .toDate();
                    this.memoize[currentId].status = 'START';
                    continue;
                }

                if (this.Graph.get(currentId).parent) {
                    const PreviousId = this.Graph.get(currentId).ParentActivity; // Yang Terhubung
                    if (Object.keys(PreviousId).length <= 1) {
                        const ID =
                            PreviousId[Object.keys(PreviousId)[0]]
                                .projectActivityId;
                        /**
                         * * Finding EF Value From Previous Node Or Activity
                         */
                        const EFCHeck =
                            this.memoize[
                                PreviousId[Object.keys(PreviousId)[0]]
                                    .projectActivityId
                                // .projectActivity
                            ]?.ef;
                        /**
                         * * If Value Not Exist
                         */
                        if (!EFCHeck) {
                            /**
                             * * Do The Recusion To Find The Value
                             * ! Do With Caution
                             */
                            this.forwardPass(
                                Act,
                                false,
                                '' +
                                    PreviousId[Object.keys(PreviousId)[0]]
                                        .projectActivityId
                            );
                        }
                        /**
                         * * Set ES Value From Previous Node / Activity
                         */
                        this.memoize[currentId].es =
                            this.memoize[
                                PreviousId[
                                    Object.keys(PreviousId)[0]
                                ].projectActivityId
                            ].ef;
                        /**
                         * * Set EF With Equation EF = LS + Time To Completed
                         */
                        this.memoize[currentId].ef =
                            this.memoize[currentId].es +
                            this.Graph.get(currentId).timeToComplete;
                        this.memoize[currentId].date = moment(
                            this.memoize[ID].date
                        )
                            .add(this.Graph.get('' + ID).timeToComplete, 'days')
                            .toDate();
                        this.memoize[currentId].status = 'GOING';
                    }
                    if (Object.keys(PreviousId).length >= 2) {
                        const GetEFValue: Array<number> = [];
                        const GetDateValues: Moment[] = [];

                        for (const key in PreviousId) {
                            const num = this.memoize[key]?.ef;
                            const dates = this.memoize[key]?.date;

                            if (!num) {
                                this.forwardPass(Act, false, key);
                                const nums = this.memoize[key]?.ef;
                                const dates = this.memoize[key]?.date;
                                GetEFValue.push(nums);
                                GetDateValues.push(moment(dates));
                            }
                            if (num) {
                                GetEFValue.push(num);
                                GetDateValues.push(moment(dates));
                            }
                        }

                        this.memoize[currentId].es = Math.max(...GetEFValue);
                        this.memoize[currentId].ef =
                            this.memoize[currentId].es +
                            this.Graph.get(currentId).timeToComplete;

                        this.memoize[currentId].date = moment
                            .max(GetDateValues)
                            .add(
                                this.Graph.get(currentId).timeToComplete,
                                'days'
                            )
                            .toDate();
                        this.memoize[currentId].status = 'GOING';
                    }
                }
            }

            return;
        } catch (error) {
            this.Stop = true;
            return;
        }
    }

    /**
     * * Finding Float Point, Critical Activity, And Deadline
     */
    private calculateFloatPointActivity() {
        /**
         * * Loop Through Memoize Value
         */
        for (const iterator in this.memoize) {
            const ef = this.memoize[iterator].ef; // Set Ef
            const es = this.memoize[iterator].es; // Set ES
            const ls = this.memoize[iterator].ls; // Set LS
            const lf = this.memoize[iterator].lf; // Set LF

            /**
             * * Check
             * * Equation Is
             * * LF - EF Must 0 Or
             * * LS - ES Must 0
             * * If Not Then The Float Point is Above Zero
             */
            if (lf - ef === 0) {
                this.memoize[iterator].f = lf - ef;
                this.memoize[iterator].critical = true;
            } else {
                this.memoize[iterator].f = lf - ef;
                this.memoize[iterator].critical = false;
            }
        }
        /**
         * * Set End Date
         */
        this.EndDate = moment(this.EndDate)
            .add(this.LongestTime, 'days')
            .toDate();
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

    public isItStop() {
        return this.Stop;
    }
    //#endregion
}
