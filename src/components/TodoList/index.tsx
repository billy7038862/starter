import React, { useContext, useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
import type { GetRef } from "antd";
import { Button, Form, Input, Popconfirm, Table } from "antd";

// import { IDuty, IFormInput } from "../../interfaces";

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

interface DataType {
    key: React.Key;
    name: string;
    id: string;
}

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

const TodoList: React.FC = () => {
    const [dataSource, setDataSource] = useState<DataType[]>([
        { key: 1, id: "first", name: "duty1" },
        { key: 2, id: "second", name: "duty2" }
    ]);

    const [count, setCount] = useState<number>(2);
    const [newId, setNewId] = useState<IItem["id"]>("");
    const [newDuty, setNewDuty] = useState<IItem["name"]>("");

    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
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

    const handleAdd = () => {
        const newData: DataType = {
            key: count,
            name: newDuty,
            id: newId
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
        setNewId("");
        setNewDuty("");
    };

    const handleSave = (row: DataType) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row
        });
        setDataSource(newData);
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
            onCell: (record: DataType) => ({
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
            <Input
                placeholder="Enter id"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                style={{ marginRight: 10 }}
            />
            <Input
                placeholder="Enter duty name"
                value={newDuty}
                onChange={(e) => setNewDuty(e.target.value)}
                style={{ marginRight: 10 }}
            />
            <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                Add a row
            </Button>
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
