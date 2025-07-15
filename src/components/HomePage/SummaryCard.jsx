import React from 'react'
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertTriangle, FileText, TrendingUp, Users } from "lucide-react";


const SummaryCard = () => {
    const importantSummary = [
  {
    title: "CARs Open",
    value: 2,
    icon: AlertTriangle,
    color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
    trend: "+1",
    trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
  },
  {
    title: "Obs Open",
    value: 10,
    icon: FileText,
    color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
    trend: "+3",
    trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
  },
  {
    title: "Delay in Audits (days)",
    value: 5,
    icon: TrendingUp,
    color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
    trend: "+2",
    trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
  },
  {
    title: "Project KPIs Achieved (%)",
    value: "90%",
    icon: Users,
    color: "text-orange-600 bg-orange-100/60 dark:bg-orange-900/30 dark:text-orange-400",
    trend: "+5%",
    trendColor: "text-orange-600 border-orange-600 dark:text-orange-400 dark:border-orange-400"
  }
];
  return (
   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {importantSummary.map((item) => (
    <Card key={item.title}>
      <CardHeader>
        <div className={`w-fit rounded-lg p-2 transition-colors ${item.color}`}>
          <item.icon size={26} />
        </div>
        <p className="card-title">{item.title}</p>
      </CardHeader>
      <CardBody className="bg-slate-100 transition-colors dark:bg-slate-950">
        <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{item.value}</p>
        <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium ${item.trendColor}`}>
          <TrendingUp size={18} />
          {item.trend}
        </span>
      </CardBody>
    </Card>
  ))}
</div>
  )
}

export default SummaryCard

 