import MysqlPrisma from '../../common/services/mysql.service.config';
import { CreateProjectDto } from '../dto/create.project.dto';
import { PatchProjectDto } from '../dto/patch.project.dto';

class ProjectDao {
    async create(id: number, resource: CreateProjectDto) {
        return MysqlPrisma.project.create({
            data: {
                ...resource,
                userOwner: id,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    async readProjectByIdProjectOrIdUser(idUser: number, idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                userOwner: idUser,
                projectId: idProject,
            },
        });
    }

    async readAll(idUser: number) {
        return MysqlPrisma.project.findMany({
            where: {
                userOwner: idUser,
            },
            select: {
                projectName: true,
                projectId: true,
                deadline: true,
                deadlineInString: true,
            },
        });
    }

    async delete(idProject: number) {
        return MysqlPrisma.project.delete({
            where: {
                projectId: idProject,
            },
        });
    }

    async patch(idUser: number, idProject: number, resource: PatchProjectDto) {
        return MysqlPrisma.project.update({
            where: {
                projectId: idProject,
            },
            data: {
                ...resource,
                userOwner: idUser,
                updatedAt: new Date(),
            },
        });
    }
}

export default new ProjectDao();
