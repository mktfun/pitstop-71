import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  linkTo?: string;
  linkText?: string;
  description?: string;
}
const KPICard = ({
  title,
  value,
  icon: Icon,
  linkTo,
  linkText,
  description
}: KPICardProps) => {
  return <Card className="group bg-card/95 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm ring-1 ring-border/50 h-full relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
        {description && <p className="text-xs text-muted-foreground py-0 px-0 my-[23px]">{description}</p>}
        {linkTo && linkText && <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <div className="p-4 pt-2">
              <Button asChild variant="ghost" size="sm" className="h-auto p-0 text-xs font-medium text-primary hover:text-primary/80 hover:bg-transparent w-full justify-start">
                <Link to={linkTo} className="inline-flex items-center gap-1">
                  {linkText}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default KPICard;