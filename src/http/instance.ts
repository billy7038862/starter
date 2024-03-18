import axios from "axios";
import process from "process";

const instance = axios.create({
    baseURL: process.env.BASEURL || "http://localhost:3001",
    timeout: 10000
});

export default instance;
