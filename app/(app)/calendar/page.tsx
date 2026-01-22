'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'liturgical' | 'diocesan' | 'parish';
  liturgicalRank?: string;
  location?: string;
  color?: string;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Chúa nhật I Mùa Vọng', date: '2024-12-01', type: 'liturgical', liturgicalRank: 'Solemnity', color: 'purple' },
  { id: '2', title: 'Lễ Đức Mẹ Vô Nhiễm', date: '2024-12-08', type: 'liturgical', liturgicalRank: 'Solemnity', color: 'blue' },
  { id: '3', title: 'Họp Linh mục đoàn', date: '2024-12-10', type: 'diocesan', location: 'TGM' },
  { id: '4', title: 'Lễ Giáng sinh', date: '2024-12-25', type: 'liturgical', liturgicalRank: 'Solemnity', color: 'white' },
];

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [filterType, setFilterType] = useState('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEvents.filter(e => e.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'liturgical': return 'bg-purple-100 text-purple-800';
      case 'diocesan': return 'bg-blue-100 text-blue-800';
      case 'parish': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = mockEvents.filter(e =>
    filterType === 'all' || e.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lịch & Sự kiện</h1>
          <p className="text-gray-600">Lịch phụng vụ và sự kiện Giáo phận</p>
        </div>
        <Button>+ Thêm sự kiện</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sự kiện</SelectItem>
                <SelectItem value="liturgical">Lịch phụng vụ</SelectItem>
                <SelectItem value="diocesan">Sự kiện Giáo phận</SelectItem>
                <SelectItem value="parish">Sự kiện Giáo xứ</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Tháng
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Danh sách
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'month' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                &lt; Trước
              </Button>
              <CardTitle>
                {months[month]} {year}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                Sau &gt;
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Days of week header */}
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`text-center py-2 font-semibold text-sm ${
                    day === 'CN' ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}

              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 min-h-[80px]"></div>
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const events = getEventsForDate(day);
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();
                const dayOfWeek = (firstDayOfMonth + i) % 7;

                return (
                  <div
                    key={day}
                    className={`p-1 min-h-[80px] border rounded-lg hover:bg-gray-50 cursor-pointer ${
                      isToday ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        dayOfWeek === 0 ? 'text-red-600' : ''
                      } ${isToday ? 'text-blue-600' : ''}`}
                    >
                      {day}
                    </div>
                    {events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 mb-1 rounded truncate ${getEventTypeColor(event.type)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500">+{events.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sự kiện sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">📅</p>
                <p>Không có sự kiện nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-16 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {months[new Date(event.date).getMonth()]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      {event.location && (
                        <p className="text-sm text-gray-600">Địa điểm: {event.location}</p>
                      )}
                      {event.liturgicalRank && (
                        <p className="text-sm text-gray-600">Bậc lễ: {event.liturgicalRank}</p>
                      )}
                    </div>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type === 'liturgical' ? 'Phụng vụ' :
                       event.type === 'diocesan' ? 'Giáo phận' : 'Giáo xứ'}
                    </Badge>
                    <Button variant="ghost" size="sm">Chi tiết</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Chú thích</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-200 rounded"></div>
              <span className="text-sm">Lịch phụng vụ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span className="text-sm">Sự kiện Giáo phận</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span className="text-sm">Sự kiện Giáo xứ</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
