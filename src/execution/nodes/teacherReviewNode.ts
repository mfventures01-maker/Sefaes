import { TeacherReviewExecutor } from '../teacherReviewExecutor';

export class TeacherReviewNode {
    private executor = new TeacherReviewExecutor();

    public async execute(type: string, payload: any, identity: any): Promise<any> {
        return this.executor.execute(type, payload, identity);
    }
}
