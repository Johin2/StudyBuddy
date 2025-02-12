import jwt from 'jsonwebtoken'

export async function POST(request){
   try{
    const {refreshToken} = await request.json();

    if (!refreshToken) {
        return new Response(
            JSON.stringify({error: "Refresh token is required", status: 400}),
        );
    }
    let payload;
    try{
        paylaod = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return new Response(
            JSON.stringify({error: "Invalid refresh token", status: 401})
        )
    }

    const newAccessToken = jwt.sign(
        {id: payload.id, email: payload.email},
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    );

    return new Response(
        JSON.stringify({token: newAccessToken, status: 200})
    )

    } catch (error){
        console.error("Refresh token endpoint error", error);
        return new Response(
            JSON.stringify({error: "Internal server error", status: 500})
        )
    };
}