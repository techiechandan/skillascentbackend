const cookieOption1 = {
    // maxAge:Date.now()+60*60*1000, 
    httpOnly: true,
    // domain: "skillascent.in",
    sameSite: "none",
    secure:true,
}


const cookieOption2 ={
    // maxAge:Date.now()+30*24*60*60*1000, 
    httpOnly: true,
    // domain: "skillascent.in",
    sameSite: "none",
    secure:true,
}

exports = {
    cookieOption1,
    cookieOption2
}