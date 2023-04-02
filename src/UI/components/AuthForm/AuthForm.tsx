import { Hash } from "crypto";
import React, { useState } from "react";
import cls from "./AuthForm.module.css";
import envHelper from '../../../helpers/envHelper';
import { authHelper } from '../../../helpers/authHelper';
import RegistrationRequest from "src/models/Auth/RegistrationRequest";
import IUserInfoFromJwt from '../../../models/Auth/IUserInfoFromJwt';
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitEnabled, setSubmitEnabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [commonMessage, setCommonMessage] = useState("");
    const navigate = useNavigate();


    const onSubmit = async () => {
        setSubmitEnabled(false);
        setTimeout(() => setSubmitEnabled(true), 5000);
        setErrorMessage("");
        setCommonMessage("");
        console.info(`Submitting: ${email}:${password}`);

        let result: IUserInfoFromJwt | undefined;
        try {
            result = await authHelper.performRegistrationAsync(new RegistrationRequest(email, password), true);
        } catch { }

        console.info(`Received object from server:`);
        console.info(result);

        if (!result) {
            if (authHelper.lastStatus) {
                let status = authHelper.lastStatus;
                let selectedError: string;

                if (status === 400)
                    selectedError = "Problem on client side. Please reload window.";
                else if (status === 401)
                    selectedError = "Wrong password.";
                else if (status === 404)
                    selectedError = "Server was unable to find existing account and refused to create new one.";
                else if (status === 409)
                    selectedError = "Server has found existing account but refused to authorize it.";
                else if (status >= 500)
                    selectedError = "Problem on server side. Please try later.";
                else {
                    selectedError = "Unable to send data to server.";
                }

                setErrorMessage(selectedError + `\nError code: HTTP_${status}.`);
            }
            else {
                setErrorMessage("Unable to send data to server.")
            }
        }
        else {
            setCommonMessage("OK...");
            console.info("Redirecting to personal...");
            navigate("/personal");
        }

        setSubmitEnabled(true);
    }


    return (
        <span className={cls.AuthWrapper}>
            <div className={[cls.AuthWrapperHeader, cls.AuthText].join(' ')}>login or register</div>
            <br />
            <input
                type={"email"}
                placeholder="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={[cls.AuthWrapperElement, cls.AuthInput, cls.AuthText].join(' ')} />
            <br />
            <input
                type={"password"}
                placeholder="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={[cls.AuthWrapperElement, cls.AuthInput, cls.AuthText].join(' ')} />
            <br />
            <button
                type="submit"
                onClick={onSubmit}
                className={[cls.AuthWrapperElement, cls.AuthButton, cls.AuthText].join(' ')} disabled={!submitEnabled}>submit</button>
            <br />
            {errorMessage
                ? <div
                    className={[cls.AuthWrapperElement, cls.AuthText, cls.AuthMessageBox, cls.AuthErrorBox].join(' ')}
                >{errorMessage}</div>
                : <span />
            }
            <br />
            {commonMessage
                ? <div
                    className={[cls.AuthWrapperElement, cls.AuthText, cls.AuthMessageBox, cls.AuthCommonBox].join(' ')}
                >{commonMessage}</div>
                : <span />
            }
        </span>
    );
}

export default AuthForm;