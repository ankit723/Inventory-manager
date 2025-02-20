'use server'
import { prisma } from "@/lib/db"
import { User } from "@prisma/client"

export const createUser = async (user: User) => {
    const res = await prisma.user.create({
        data: user
    })
    if (!res) {
        throw new Error('Failed to create user')
    }
    return res
}

export const checkUser = async (email: string) => {
    const res = await prisma.user.findUnique({
        where: { email }
    })
    if (!res) {
        return false
    }
    return true
}   