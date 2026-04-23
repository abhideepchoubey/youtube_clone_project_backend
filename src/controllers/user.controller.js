import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"



const generateAccessAndRefreshTokens= async(userId) =>
    {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
        
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating Refresh and Access Token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user alreday exists : username,email
    //check for images ,check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password & refresh token field from response
    //check for user creation
    // return res

    // console.log("FILES:", req.files)
    // console.log("BODY:", req.body)

    const {fullname ,email,username,password}=req.body
    // console.log("email : ",email)

    // if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    // }

    if(
        [fullname,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser= await User.findOne({
        $or:[{username} , {email}]
    })
    
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    //console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path

    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    let coverImageLocalPath;
    if ( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }


    //console.log(avatarLocalPath)

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //console.log(avatar)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is not uploaded , try again")
    }
    
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500 ,"Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser ,"User registered successfully")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    //request email/username and password from user,req.body->data
    //username or email
    //check if any user exists with that email/username
    //if exists ,check if password is correct or not
    //access and refresh token generated
    //send in form of cookies 

    const {email,username,password}=req.body 

    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }
    // if(
    //     [email,password].some((field)=> field?.trim() === "")
    // ){
    //     throw new ApiError(400,"All fields are required")
    // }
    const existedUser = await User.findOne({
    $or: [
        { email: email },
        { username: username }
    ]
    })
    
    if(!existedUser){
        throw new ApiError(404,"User doesn't exist")
    }

    const isPasswordCorrect = await existedUser.isPasswordCorrect(password)
    if(!isPasswordCorrect) {
        throw new ApiError(401, " Invalid Credentials ")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(existedUser._id)
    
    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")
    
    const options = {
        httpOnly : true,
        secure:true
    }
    // return res.status(200).json(
    //     new ApiResponse(200, loggedInUser ,"User logged in successfully")
    // )
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    );
})

const logOutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User logged Out Successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefeshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefeshToken){
        throw new ApiError(401,"Unauthorised request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefeshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user= await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefeshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken : newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newrefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword,confirmPassword} = req.body
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required")
    }

    if(newPassword!==confirmPassword) {
        throw new ApiError(400,"Password doesn't Match")
    }
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError("Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>
{
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

const updateAccountDetails = asyncHandler(async(req,res)=>
{
    const {fullname,email} = req.body
    if(!fullname || !email) {
        throw new ApiError(400,"All fields  are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullname : fullname,
                email : email
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        ))
})

const updateUserAvatar = asyncHandler(async(req,res)
=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new:true}
        ).select("-password")
        return res
        .status(200)
        .json(
        new ApiResponse(
            200,
            {},
            "Avatar Image updated successfully"
        ))
})
const updateUserCoverImage = asyncHandler(async(req,res)
=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on CoverImage")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new:true}
        ).select("-password")
        return res
        .status(200)
        .json(
        new ApiResponse(
            200,
            user,
            "CoverImage updated successfully"
        ))
})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}