import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cred from "../JSON/client.json"
import qs from 'qs'; 

const OauthSuccess = () => {
    const url = window.location.search;
    const regex = /code=(.*?)&/;
    const match = url.match(regex);
    const code = match ? match[1] : null;

    const client_id = cred.web.client_id;
    const client_secret = cred.web.client_secret;
    const [resp, setResp] = useState("");

        useEffect(() => {
        if (code) {
            const data = qs.stringify({
                client_id: client_id,
                client_secret: client_secret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: cred.web.redirect_uris[0]
            });

            const config = {
                method: 'post',
                url: 'https://oauth2.googleapis.com/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };

            axios(config)
            .then(response => {
                console.log(response.data);
                setResp(response.data.refresh_token);
            })
            .catch(error => {
                console.error(error);
            });
        }
    }, []);

    return (
        <>
            <div>{resp}</div>
        </>
    );
}

export default OauthSuccess;
