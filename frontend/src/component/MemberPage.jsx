import MemberInfo from "./MemberInfo"
import MemberSidebar from "./MemberSidebar"
import "../Css/MemberPage.css"

function MemberPage() {
    return (
        <div className="member-page">
            <MemberSidebar />
            <MemberInfo></MemberInfo>
        </div>
    )


}

export default MemberPage