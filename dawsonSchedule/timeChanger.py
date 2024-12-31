from datetime import datetime

def timeChange(time):
    time_list = []
    times = time.split('-')
    in_time = datetime.strptime(times[0].strip(), "%I:%M %p")
    out_time = datetime.strftime(in_time, "%H:%M")
    in_time2 = datetime.strptime(times[1].strip(), "%I:%M %p")
    out_time2 = datetime.strftime(in_time2, "%H:%M")

    return f"{out_time} - {out_time2}"
