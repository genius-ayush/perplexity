import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import axios from "axios"
import { useEffect, useState } from "react"
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { BACKENDURL } from "@/lib/config";
const supabase = createClient();

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {

        async function getInfo() {
            const { data, error } = await supabase.auth.getUser()

            if (data.user) {
                setUser(data.user)
            } else {
                alert(`error getting the user ${error}`)
            }
        }

        getInfo();

    }, [])

    useEffect(()=>{

        async function getExistingConversations(){

            if(user){
               const {data : {session}} = await supabase.auth.getSession() ;  
               const jwt = session?.access_token ; 
               const response = await axios.get(`${BACKENDURL}/conversations` , {
                headers:{
                    Authorization : jwt 
                }
               })

               console.log(response.data) ;
            }  
        }

        getExistingConversations() ; 
    } , [user])
    return (
        <div>
            {!user && <Button onClick={() => { navigate("/auth") }}>Signin</Button>}
            {user && <Button onClick={() => {
                supabase.auth.signOut()
                setUser(null);
            }}>Logout</Button>}
            {user?.email}
        </div>  
    )
}