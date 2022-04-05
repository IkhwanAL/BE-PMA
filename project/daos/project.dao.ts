import moment from 'moment';
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
                UserTeam: {
                    create: [
                        {
                            role: 'Proyek_Manager',
                            userId: id,
                        },
                    ],
                },
            },
        });
    }

    async readProjectByIdProjectOrIdUser(idUser: number, idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                userOwner: idUser,
                projectId: idProject,
            },
            include: {
                UserTeam: {
                    include: {
                        User: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                ProjectActivity: true,
            },
        });
    }

    async readProjectByIdUserTeamAndIdProject(
        idUserTeam: number,
        idProject: number
    ) {
        return MysqlPrisma.project.findFirst({
            include: {
                UserTeam: {
                    where: {
                        userId: idUserTeam,
                        projectId: idProject,
                    },
                    include: {
                        User: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                ProjectActivity: true,
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

    async readOne(idProject: number) {
        return MysqlPrisma.project.findFirst({
            where: {
                projectId: idProject,
            },
            include: {
                ProjectActivity: true,
            },
        });
    }

    async patchDeadline(idProject: number, deadline: number) {
        return MysqlPrisma.project.update({
            where: {
                projectId: idProject,
            },
            data: {
                deadline: moment().add(deadline, 'days').toDate(),
                deadlineInString: deadline.toString(),
                updatedAt: new Date(),
            },
        });
    }
}

export default new ProjectDao();
