import { StudentCommandTypes } from "./studentCommands";
import { ExamCommandTypes } from "./examCommands";
import { ResultCommandTypes } from "./resultCommands";
import { CBTCommandTypes } from "./cbtCommands";

const ALL_EDU_COMMANDS = {
    ...StudentCommandTypes,
    ...ExamCommandTypes,
    ...ResultCommandTypes,
    ...CBTCommandTypes
};

export function isEduCommand(type: string): boolean {
    return Object.values(ALL_EDU_COMMANDS).includes(type as any);
}

export { StudentCommandTypes, ExamCommandTypes, ResultCommandTypes, CBTCommandTypes };

