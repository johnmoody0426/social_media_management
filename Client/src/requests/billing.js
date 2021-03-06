import axios from "axios";
import {apiUrl} from "../config/api";

export const changePlan = (plan) => {
    return axios.post(`${apiUrl}/billing/change/plan`, {plan})
            .then((response) => {
                return response.data;
            });
}

export const cancelAddon = (addon) => {
    return axios.post(`${apiUrl}/billing/cancel/addon`, {addon})
            .then((response) => {
                return response.data;
            });
}

export const activateAddon = (addon) => {
    return axios.post(`${apiUrl}/billing/activate/addon`, {addon})
            .then((response) => {
                return response.data;
            });
}

export const createSubscription = (token) => {
    return axios.post(`${apiUrl}/billing/subscription/create`, { token })
        .then((response) => {
            return response.data;
        });
}

export const checkCoupon = (coupon) => {
    return axios.get(`${apiUrl}/billing/coupon?id=${coupon}`)
        .then((response) => {
            return response.data;
        });
}

export const getPlans = () => {
    return axios.get(`${apiUrl}/billing/plans`)
        .then((response) => {
            return response.data;
        });
}

export const getPlanData = () => {
    return axios.get(`${apiUrl}/billing/plan-data`)
        .then((response) => {
            return response.data;
        });
}

export const cancelSubscription = (feedback) => {
    return axios.post(`${apiUrl}/billing/subscription/cancel`, {feedback})
        .then((response) => {
            return response.data;
        });
}

export const deleteSubscription = (customerId) => {
    return axios.post(`${apiUrl}/billing/subscription/delete`, {customerId})
        .then((response) => {
            return response.data;
        });
}

export const addSubscription = (token) => {
    return axios.post(`${apiUrl}/billing/subscription/add`, {token})
        .then((response) => {
            return response.data;
        });
}

export const updateSubscription = (token) => {
    return axios.post(`${apiUrl}/billing/subscription/update`, {token})
        .then((response) => {
            return response.data;
        });
}

export const resumeSubscription = (type) => {
    return axios.post(`${apiUrl}/billing/subscription/resume`, {type})
        .then((response) => {
            return response.data;
        });
}