import IDataType from "src/interfaces/Duty";
import instance from "../http/instance";

class DutyService {
    static addDuty = async function (payload: IDataType): Promise<IDataType> {
        const res = await instance.post(`/duties`, payload);
        return res.data;
    };

    static fetchDuties = async (): Promise<IDataType[]> => {
        const res = await instance.get("/duties");
        return res.data;
    };

    static deleteDuty = async (key: React.Key): Promise<IDataType> => {
        const res = await instance.delete(`/duties/${key}`);
        return res.data;
    };

    static updateDuty = async (key: React.Key, payload: IDataType): Promise<IDataType> => {
        const res = await instance.put(`/duties/${key}`, payload);
        return res.data;
    };
}

export default DutyService;
