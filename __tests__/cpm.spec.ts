import { project, projectactivity, userteam } from '@prisma/client';
import { CPM } from '../common/cpm/calculate.cpm.config';
import projectDao from '../project/daos/project.dao';
import moment from 'moment';

// const SampleData: project & {
//     projectactivity: projectactivity[];
//     userteam: (userteam & {
//         user: {
//             id: number;
//             firstName: string;
//             lastName: string;
//             email: string;
//             username: string;
//         };
//     })[];
// } = {
//     projectId: 2,
//     projectName: 'Proyek Baru Test 2',
//     projectDescription: 'Aplikasi Testing Ke dua',
//     startDate: moment('2022-06-30T00:00:00.000Z').toDate(),
//     deadline: moment('2022-09-22T00:00:00.000Z').toDate(),
//     deadlineInString: '84',
//     userOwner: 9,
//     createdAt: moment('2022-06-26T03:27:24.551Z').toDate(),
//     updatedAt: moment('2022-07-06T14:41:00.220Z').toDate(),
//     projectactivity: [
//       {
//         projectActivityId: 10,
//         projectId: 2,
//         name: 'Kegiatan UI / UX',
//         critical: false,
//         progress: 100,
//         position: 'Done',
//         timeToComplete: 18,
//         status: true,
//         description: 'Melakukan Research dan Membuat Tampilan',
//         parent: '',
//         child: '',
//         createdAt: moment('2022-06-26T03:28:25.957+00:00').toDate(),
//         updatedAt: moment('2022-06-26T03:54:32.817+00:00').toDate(),
//         subdetailprojectactivity: []
//       },
//       {
//         projectActivityId: 11,
//         projectId: 2,
//         name: 'UI Slicing',
//         critical: 0,
//         progress: 0,
//         position: 'Doing',
//         timeToComplete: 30,
//         status: 1,
//         description: 'Membuat Tampilan Frontend',
//         parent: '10',
//         child: '',
//         createdAt: '2022-06-26T03:29:55.235+00:00',
//         updatedAt: '2022-06-26T03:54:35.932+00:00',
//         subdetailprojectactivity: [Array]
//       },
//       {
//         projectActivityId: 12,
//         projectId: 2,
//         name: 'Membuat Server',
//         critical: 0,
//         progress: 67,
//         position: 'Review',
//         timeToComplete: 7,
//         status: 1,
//         description: 'Server Untuk Database dan Backend',
//         parent: '10',
//         child: '',
//         createdAt: '2022-06-26T03:31:12.052+00:00',
//         updatedAt: '2022-06-26T03:54:26.809+00:00',
//         subdetailprojectactivity: [Array]
//       },
//       {
//         projectActivityId: 13,
//         projectId: 2,
//         name: 'Membuat Logika Sistem Backend',
//         critical: 0,
//         progress: 0,
//         position: 'Doing',
//         timeToComplete: 30,
//         status: 1,
//         description: 'Logika Untuk Menjalankan Sistem',
//         parent: '12',
//         child: '',
//         createdAt: '2022-06-26T03:32:33.409+00:00',
//         updatedAt: '2022-06-26T03:54:37.248+00:00',
//         subdetailprojectactivity: [Array]
//       },
//       {
//         projectActivityId: 14,
//         projectId: 2,
//         name: 'Development Testing',
//         critical: 0,
//         progress: 0,
//         position: 'To_Do',
//         timeToComplete: 24,
//         status: 1,
//         description: 'Testing Aplikasi',
//         parent: '11,13',
//         child: '',
//         createdAt: '2022-06-26T03:33:58.203+00:00',
//         updatedAt: '2022-06-26T03:33:58.207+00:00',
//         subdetailprojectactivity: [Array]
//       },
//       {
//         projectActivityId: 15,
//         projectId: 2,
//         name: 'Deploy Beta Testing',
//         critical: 0,
//         progress: 0,
//         position: 'To_Do',
//         timeToComplete: 5,
//         status: 1,
//         description: '-',
//         parent: '12,14',
//         child: '',
//         createdAt: '2022-06-26T03:34:49.576+00:00',
//         updatedAt: '2022-06-26T03:34:49.579+00:00',
//         subdetailprojectactivity: [Array]
//       }
//     ],
//     userteam: [
//       {
//         teamId: 2,
//         userId: 9,
//         projectId: 2,
//         role: 'Proyek_Manager',
//         addedAt: '2022-06-26T03:27:24.556Z',
//         user:
//       }
//     ]
//   }

const idDataToTest_Fail = 1;
const idDataToTest_Complete = 2;

describe('Critical Path Method Dapat menentukan batas waktu pengerjaan', () => {
    test('seharusnya sistem dapat menolak kegiatan yang menyebabkan infinite loop', async () => {
        let one = await projectDao.getOneWithProjectId(idDataToTest_Fail);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();

        expect(cpm.isItStop()).toBeTruthy();
    });

    test('seharusnya menolak jika aktifitas kurang dari 2', async () => {
        let one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        one = {
            projectactivity: one.projectactivity.slice(0, 1), // Mengurangi Value Aktifitas Kurang Dari 2
            userteam: one.userteam,
            createdAt: one.createdAt,
            deadline: one.deadline,
            deadlineInString: one.deadlineInString,
            projectDescription: one.projectDescription,
            projectId: one.projectId,
            projectName: one.projectName,
            startDate: one.startDate,
            updatedAt: one.updatedAt,
            userOwner: one.userOwner,
        };

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();

        expect(cpm.getDeadLine()).toEqual(0);
        expect(cpm.getCalculate()).toEqual({});
    });

    test('seharusnya dapat menentukan nilai ef, es, ls, ls', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].ef).not.toBeNull();
            expect(res[iterator].es).not.toBeNull();
            expect(res[iterator].lf).not.toBeNull();
            expect(res[iterator].ls).not.toBeNull();
        }
    });

    test('seharusnya bisa menghitung deadline', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();

        expect(cpm.getDate()).toBeDefined();
        expect(cpm.getDeadLine()).not.toEqual(0);
        // expect(cpm.getDate()).toEqual(new Date('2022-09-22T00:00:00.000Z'));
    });
});

describe('Critical Path Method dapat menentukan kegiatan kritikal', () => {
    test('seharusnya dapat menentukan nilai float pada aktifitas', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].f).not.toBeNull();
        }
    });
    test('seharusnya dapat menentukan nilai jalur kritikal', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].critical).not.toBeNull();
        }
    });
});
