const mask = (phone) => {
    const regex = /(\d{2})(\d{2})(\d{5})(\d{4})/
    return phone.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '$1($2)$3-$4')
}

console.log(mask('55119991138'))