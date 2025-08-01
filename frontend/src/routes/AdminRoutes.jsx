import { Routes, Route } from "react-router-dom";
import PrimaryUsers from "@/pages/admin/PrimaryUsers";
import ProfileCard from "@/pages/admin/ProfilePage";
import ProtectedAdmin from "./ProtectedAdmin";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path='/admin/home' element={<ProtectedAdmin><PrimaryUsers /> </ProtectedAdmin>}/>
        <Route path='/admin/primaryUsers' element={<ProtectedAdmin><PrimaryUsers /> </ProtectedAdmin>}/>
      <Route path='/admin/profile/:userId' element={<ProtectedAdmin><ProfileCard /> </ProtectedAdmin>}/>
   </Routes>
  );
}
