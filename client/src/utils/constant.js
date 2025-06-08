const BASE_URL = import.meta.env.VITE_BACKEND_URL + "/api";
export const USER_API_END_POINT = `${BASE_URL}/user`;
export const JOB_API_END_POINT = `${BASE_URL}/job`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/application`;
export const COMPANY_API_END_POINT = `${BASE_URL}/company`;
export const CHATBOT_API_END_POINT = `${BASE_URL}/chatboat/ask`; 


export const GET_JOBS_FROM_API = `${BASE_URL}/jobs/fetch-jobs`; 
