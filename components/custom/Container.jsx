import { LeftBar } from "./LeftBar"
import { ActualDate } from "./ActualDate"
import { MyCalendar } from "./MyCalendar"
import { RightBar } from "./RightBar"

export const Container = () => {
    return (
        <div className="containerBox">
            <LeftBar />
            <MyCalendar />
            <RightBar />
        </div>
    )
}