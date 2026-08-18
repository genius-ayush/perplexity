import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
// import Login from "@/app/routes/login";
// import { createClient } from '@supabase/supabase-js'
const supabase = createClient() ; 
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)



export default function Auth() {

    

    async function login(provider: "github" | "google") {

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider : provider
        })

        console.log("data" , data) ; 

       

        if (error) {
            alert("Error while signin");
        }else{
            alert("signed in ")
        }
    }
    return (
        <div>
            <div>AuthPage</div>
            <Button onClick={() => login("google")}>Login with Google</Button>
            <Button onClick={() => login("github")}>Login with Github</Button>
        </div>
    )
}