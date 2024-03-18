import React, { useContext, useEffect, useRef, useState } from "react";
import type { GetRef } from "antd";
import { Form, Input, Popconfirm, Table } from "antd";
import ReusableForm, { IField } from "../ReuseableForm";
import DutyService from "../../service/duty.service";

import { IDataType } from "../../interfaces";

type InputRef = GetRef<typeof Input>;
type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<IItem> | null>(null);

interface IItem {
    key: string;
    name: string;
    id: string;
}

interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof IItem;
    record: IItem;
    handleSave: (record: IItem) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`
                    }
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{ paddingRight: 24 }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

const TodoList: React.FC = () => {
    useEffect(() => {
        (async () => {
            const duties = await DutyService.fetchDuties();
            setDataSource(duties);
        })();
    }, []);
    const [form] = Form.useForm();
    const fields: IField[] = [
        {
            name: "id",
            rules: [
                { required: true, message: "Please input the id!" },
                { pattern: new RegExp(/^[A-Za-z0-9]+$/), message: "ID must be a string!" }
            ],
            placeholder: "Enter id"
        },
        {
            name: "name",
            rules: [
                { required: true, message: "Please input the name!" },
                { pattern: new RegExp(/^[A-Za-z0-9]+$/), message: "Name must be a string!" }
            ],
            placeholder: "Enter name"
        }
    ];

    const [dataSource, setDataSource] = useState<IDataType[]>([]);

    const handleDelete = async (key: React.Key) => {
        await DutyService.deleteDuty(key);
        const duties = await DutyService.fetchDuties();
        setDataSource(duties);
    };

    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: "id",
            dataIndex: "id",
            editable: true
        },
        {
            title: "name",
            dataIndex: "name",
            width: "30%",
            editable: true
        },
        {
            title: "operation",
            dataIndex: "operation",
            render: (_, record: { key: React.Key }) =>
                dataSource.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                        <a>Delete</a>
                    </Popconfirm>
                ) : null
        }
    ];

    const handleAdd = async () => {
        try {
            const dutyObject: IItem = await form.validateFields();

            await DutyService.addDuty(dutyObject);

            const duties = await DutyService.fetchDuties();
            setDataSource(duties);

            // Reset the form fields
            form.resetFields();
        } catch (error) {
            console.log("Validation failed:", error);
        }
    };

    const handleSave = async (row: IDataType) => {
        try {
            await DutyService.updateDuty(row.key, row);
            const duties = await DutyService.fetchDuties();
            setDataSource(duties);
        } catch (error) {
            alert(error);
        }
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell
        }
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: IDataType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave
            })
        };
    });

    return (
        <div>
            <ReusableForm form={form} handleAdd={handleAdd} fields={fields} />
            <Table
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={dataSource}
                columns={columns as ColumnTypes}
            />
        </div>
    );
};

export default TodoList;
