import axios from 'axios'


const api = axios.create({
    // baseURL: 'http://localhost:19000'
    baseURL: 'https://webhooks.inbot.com.br/inbot-adm-back/v1/gateway'
})

export default api