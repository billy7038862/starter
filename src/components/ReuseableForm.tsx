import React from "react";
import { Form, Input, Button } from "antd";
import { FormInstance } from "antd/lib/form";

export interface IField {
    name: string;
    rules: { message: string; required?: boolean; pattern?: RegExp }[];
    placeholder: string;
}

interface IReusableFormProps {
    form: FormInstance;
    handleAdd: () => void;
    fields: IField[];
}

const ReusableForm: React.FC<IReusableFormProps> = ({ form, handleAdd, fields }) => (
    <Form form={form} layout="inline">
        {fields.map((field, index) => (
            <Form.Item key={index} name={field.name} rules={field.rules}>
                <Input placeholder={field.placeholder} />
            </Form.Item>
        ))}
        <Form.Item shouldUpdate={true}>
            <Button type="primary" onClick={handleAdd}>
                Add a row
            </Button>
        </Form.Item>
    </Form>
);

export default ReusableForm;
