import { CPM } from '../common/cpm/calculate.cpm.config';
import projectDao from '../project/daos/project.dao';

const idDataToTest_Fail = 1;
const idDataToTest_Complete = 2;
const idDataToTest_Test = 3;

describe('Critical Path Method Dapat menentukan batas waktu pengerjaan', () => {
    test('sistem seharusnya dapat menghentikan kalkulasi yang menyebabkan perulangan tak terbatas', async () => {
        let one = await projectDao.getOneWithProjectId(idDataToTest_Fail);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();

        expect(cpm.isItStop()).toBeTruthy();
    });

    test('sistem seharusnya menolak jika aktifitas kurang dari 2', async () => {
        let one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        one = {
            projectactivity: one.projectactivity, // Mengurangi Value Aktifitas Kurang Dari 2
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

    test('sistem seharusnya dapat menentukan nilai ef, es', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].ef).not.toBeNull();
            expect(res[iterator].ef).not.toBeNaN();

            expect(res[iterator].es).not.toBeNull();
            expect(res[iterator].es).not.toBeNaN();
        }
    });

    test('sistem seharusnya bisa menghitung deadline', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();

        expect(cpm.getDate()).toBeDefined();
        expect(cpm.getDeadLine()).not.toEqual(0);
        // expect(cpm.getDate()).toEqual(new Date('2022-09-22T00:00:00.000Z'));
    });
});

describe('Critical Path Method dapat menentukan kegiatan kritikal', () => {
    test('sistem seharusnya dapat menentukan nilai lf, ls', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].lf).not.toBeNull();
            expect(res[iterator].lf).not.toBeNaN();

            expect(res[iterator].ls).not.toBeNull();
            expect(res[iterator].ls).not.toBeNaN();
        }
    });
    test('sistem seharusnya dapat menentukan nilai float pada aktifitas', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].f).not.toBeNull();
            expect(res[iterator].f).not.toBeNaN();
        }
    });
    test('sistem seharusnya dapat menentukan nilai jalur kritikal', async () => {
        const one = await projectDao.getOneWithProjectId(idDataToTest_Complete);

        const cpm = new CPM(one, one.startDate);

        cpm.calculate();
        const res = cpm.getCalculate();

        for (const iterator in res) {
            expect(res[iterator].critical).not.toBeNull();
        }
    });
});
