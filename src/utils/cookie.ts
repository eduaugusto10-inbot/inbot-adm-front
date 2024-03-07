import Cookies from 'js-cookie';

const checkAuth = () => {
    const allCookies = Cookies.get();
    console.log(allCookies)
    const InAuth = Cookies.get("InAuth");
    if (InAuth){
        return InAuth && InAuth.slice(-3) === "123";
    }
    return false
}

export default checkAuth