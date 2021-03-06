import re
from datetime import datetime
import eel
import time

eel.init('web')


class job:
    def __init__(self):
        self.steps = []
        self.excp = []
        self.prog = []
        self.cpu = []
        self.start = ''
        self.end = ''
        self.execTime = []

    def initialize(self):
        self.steps = []
        self.excp = []
        self.prog = []
        self.cpu = []
        self.start = ''
        self.end = ''
        self.execTime = []

    def getStep(self):
        return self.steps

    def getExcp(self):
        return self.excp

    def getProg(self):
        return self.prog

    def getCpu(self):
        return self.cpu

    def getExecTime(self):
        return self.execTime

    def getStart(self):
        return self.start

    def getEnd(self):
        return self.end

    def setstart(self, start):
        self.start = start

    def setend(self, end):
        self.end = end

    def addstep(self, step):
        self.steps.append(step)

    def addexcp(self, excp):
        self.excp.append(excp)

    def addcpu(self, cpu):
        self.cpu.append(cpu)

    def addprog(self, prg):
        self.prog.append(prg)

    def setExecTime(self, timearr):
        self.execTime = timearr


bau = job()
prj = job()

error = ""

def findstarttime(x, l):
    pos = l.find("STARTED")
    if pos == 39:
        timestart = l[54:62]
        x.setstart(timestart)


def findendtime(x, l):
    pos = l.find("ENDED - TIME")
    if pos == 39:
        x.setend(l[52:62])


def findstep(x, l):
    pos =  re.search("-P...     S...", l)
    pos2 = re.search("-P....... S...", l)
    pos3 = re.search("-P...     S.......", l)
    if pos or pos2 or pos3:
        print(l)
        if len(x.getStep()) == 0:
            eel.updatestatus("Searching for job steps..")

        x.addstep(l[30:38].strip())
        print(l[46:51].strip())

        if l[46:51].strip().isnumeric():
            x.addexcp(int(l[46:51].strip()))
        else:
            i = 46
            temp = ''
            while i < 52:
                if l[i].isnumeric() or l[i] == 'K' or l[i] == '.':
                    if l[i] == 'K':
                        temp += '000'
                        i = 52
                    elif l[i] == '.':
                        i = 52
                    else:
                        temp += str(l[i])
                i += 1
            x.addexcp(int(temp.strip()))
            print(temp.strip())

def findprog(x, l):
    pos = re.search("PROGRAM - ", l)

    if pos:
        if len(x.getProg()) == 0:
            eel.updatestatus("Searching for programs..")
        x.addprog(l[21:30])
        print(l)
        if l[73:78].strip().isnumeric():
            x.addcpu(float(l[73:78].strip()))
        else:
            i = 73
            temp = ''
            while i < 78:
                if l[i].isnumeric() or l[i] == '.':
                    temp += str(l[i])
                i += 1
            x.addcpu(float(temp.strip()))


def calculateElapseTime(jobversion):
    time_arr = [''] * (len(jobversion.steps) + 1)
    time_arr[0] = jobversion.start.replace(".", ":").strip()
    time_arr[-2] = jobversion.end.replace(".", ":").strip()

    FMT = '%H:%M:%S'
    elapse = abs(datetime.strptime(time_arr[-2], FMT) - datetime.strptime(time_arr[0], FMT)).seconds
    print(elapse)
    if elapse == 0:
        time_arr[-1] = "< 1sec"
    else:
        time_arr[-1] = str(convert(elapse))

    return time_arr


def convert(seconds):
    seconds = seconds % (24 * 3600)
    hour = seconds // 3600
    seconds %= 3600
    minutes = seconds // 60
    seconds %= 60
    timestr = ""
    if hour > 0:
        timestr += str(hour)
        if hour > 1:
            timestr += "hrs "
        else:
            timestr += "hr "

    if minutes > 0:
        timestr += str(minutes)
        if minutes > 1:
            timestr += "mins "
        else:
            timestr += "min "

    if seconds > 0:
        timestr = timestr + str(seconds)
        if seconds > 1:
            timestr += "secs "
        else:
            timestr += "sec"

    return timestr


def addTableSummary(jobversion):
    """SYNCH LEN OF ARRAYS TO LEN OF STEPS SO THAT TABLE WILL BE SYNCH"""
    if len(jobversion.getStep()) > len(jobversion.getProg()):
        diff = len(jobversion.getStep()) - len(jobversion.getProg())
        i = 1
        while i <= diff:
            jobversion.addprog("")
            i += 1
    if len(jobversion.getStep()) > len(jobversion.getCpu()):
        diff = len(jobversion.getStep()) - len(jobversion.getCpu())
        i = 1
        while i <= diff:
            jobversion.addcpu(0)
            i += 1
    if len(jobversion.getStep()) > len(jobversion.getExcp()):
        diff = len(jobversion.getStep()) - len(jobversion.getExcp())
        i =1
        while i <= diff:
            jobversion.addexcp(0)
            i += 1

    """ADD 1 ROW AT END OF STEPS FOR SUMMARY"""
    jobversion.steps.append("SUMMARY")
    jobversion.prog.append("")
    jobversion.cpu.append(max(jobversion.cpu))
    jobversion.excp.append(max(jobversion.excp))

def prepCpuChartData(jobversion):
    jobsteps = list.copy(bau.getStep())
    jobsteps.pop()

    cpudata = []
    cpudatadict = dict(zip(jobversion.getStep(), jobversion.getCpu()))

    for jobstep in jobsteps:
        if jobstep in cpudatadict:
            cpudata.append(cpudatadict[jobstep])
        else:
            cpudata.append(None)
    return cpudata

def prepExcpCharData(jobversion):
    jobsteps = list.copy(bau.getStep())
    jobsteps.pop()
    excpdata = []
    excpdatadict = dict(zip(jobversion.getStep(), jobversion.getExcp()))

    for jobstep in jobsteps:
        if jobstep in excpdatadict:
            excpdata.append(excpdatadict[jobstep])
        else:
            excpdata.append(None)
    return excpdata

@eel.expose
def mainprocess(baujob, prjjob):
    bau.initialize()
    prj.initialize()
    print("Analysing string tokens...")
    eel.updatestatus("Log tokens analysis started..")
    if baujob == "":
        print("bau iput is empty")
        return '-1'

    if prjjob == "":
        print("prj input is empty")
        return '-1'

    print("bau")
    eel.updatestatus("Analysing BAU logs..")
    for line in baujob:
        findstarttime(bau, line)
        findendtime(bau, line)
        findstep(bau, line)
        findprog(bau, line)

    print("prj")
    eel.updatestatus("Analysing PRJ logs..")
    for line in prjjob:
        findstarttime(prj, line)
        findendtime(prj, line)
        findstep(prj, line)
        findprog(prj, line)

    if len(bau.getStep()) == 0:
        return "-2"

    if len(prj.getStep()) == 0:
        return "-3"

    bau.setExecTime(calculateElapseTime(bau))
    prj.setExecTime(calculateElapseTime(prj))
    addTableSummary(bau)
    addTableSummary(prj)
    eel.updatestatus("Finalizing some details..")
    eel.sleep(2)
    print("Analysis completed.")
    if len(prj.getStep()) > len(bau.getStep()):
        return "-4"
    elif len(prj.getStep()) < len(bau.getStep()):
        return "-5"
    else:
        return '00'

@eel.expose
def comparestepsbau():
    missing =[]

    if len(bau.getStep()) != len(prj.getStep()):
        for baustep in bau.getStep():
            if baustep not in prj.getStep():
                missing.append("Step " + str(baustep) + " not found in PRJ version.")
    return missing

@eel.expose
def comparestepsprj():
    missing =[]
    for prjstep in prj.getStep():
        if prjstep not in bau.getStep():
            missing.append("Step " + str(prjstep) + " is a new step in PRJ version. Step not shown in chart.")
    return missing

@eel.expose
def getCpuChart(job):
    if job == "bau":
        return prepCpuChartData(bau)
    else:
        return prepCpuChartData(prj)

@eel.expose
def getExcpChart(job):
    if job == "bau":
        return prepExcpCharData(bau)
    else:
        return prepExcpCharData(prj)

@eel.expose
def getStepChart():
    steps = list.copy(bau.getStep())
    steps.pop()
    return steps

@eel.expose
def getSteps(job):
    if job == "bau":
        return bau.getStep()
    else:
        return prj.getStep()


@eel.expose
def getExcps(job):
    if job == "bau":
        return bau.getExcp()
    else:
        return prj.getExcp()


@eel.expose
def getProgs(job):
    if job == "bau":
        return bau.getProg()
    else:
        return prj.getProg()


@eel.expose
def getCpus(job):
    if job == "bau":
        return bau.getCpu()
    else:
        return prj.getCpu()


@eel.expose
def getExecTimes(job):
    if job == "bau":
        return bau.getExecTime()
    else:
        return prj.getExecTime()


@eel.expose
def getStart(job):
    if job == "bau":
        return bau.getStart()
    else:
        prj.getStart()


@eel.expose
def getEnd(job):
    if job == "bau":
        return bau.getEnd()
    else:
        return prj.getEnd()


eel.start('index.html', size=(780, 690))
