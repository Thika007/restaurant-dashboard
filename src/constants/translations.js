export const translations = {
    en: {
        navbar: {
            search: "Search transactions...",
            admin: "Admin User",
            connected: "Connected",
            logout: "Logout"
        },
        tabs: {
            todayTitle: "Today's Overview",
            historyTitle: "Historical Trends",
            reportsTitle: "Detailed Reports",
            todaySub: "Live tracking of today's restaurant performance",
            historySub: "Analyze past performance and visual trends",
            reportsSub: "View and export detailed transaction logs",
            realTime: "Real-time",
            history: "History",
            reports: "Reports",
            reportTypes: {
                bill: "Bill Report",
                item: "Item Report",
                preview: "Bill Preview",
                allCredit: "All Credit Customer",
                singleCredit: "Single Credit Customer"
            },
            billReport: {
                headers: {
                    billId: "Bill ID",
                    amount: "Amount",
                    discountType: "Discount Type",
                    tax: "TAX",
                    serviceCharge: "Service Charge",
                    totalAmount: "Total Amount",
                    txnType: "Transaction Type",
                    orderType: "Order Type",
                    remark: "Any Remark"
                },
                filters: {
                    txnType: {
                        label: "Transaction Type",
                        all: "All",
                        cash: "Cash",
                        visa: "Visa",
                        master: "Master",
                        amex: "Amex",
                        uberEats: "Uber Eats",
                        pickMe: "PickMe Food",
                        complimentary: "Complimentary",
                        wastage: "Wastage",
                        staff: "Staff",
                        credit: "Credit",
                        cancelled: "Cancelled"
                    },
                    orderType: {
                        label: "Order Type",
                        all: "All",
                        table: "Table Order",
                        takeaway: "Take Away",
                        delivery: "Delivery",
                        quick: "Quick Service"
                    },
                    discountType: {
                        label: "Discount Type",
                        all: "All",
                        manual: "By Manual Amount",
                        percentage: "By Percentage",
                        none: "Non Discount"
                    },
                    sort: {
                        label: "Amount Sort",
                        minMax: "Min to Max",
                        maxMin: "Max to Min",
                        billNo: "Order by Bill No"
                    }
                }
            },
            itemReport: {
                headers: {
                    billId: "Bill ID",
                    kotNo: "KOT No",
                    description: "Description",
                    qty: "Qty",
                    amount: "Amount",
                    specialFilter: "Special Filter",
                    reason: "Reason"
                },
                filters: {
                    mainType: {
                        label: "Type Selection",
                        all: "All Types",
                        cash: "Cash",
                        visa: "Visa",
                        master: "Master",
                        amex: "Amex",
                        uberEats: "Uber Eats",
                        pickMe: "PickMe Food",
                        complimentary: "Complimentary",
                        wastage: "Wastage",
                        staff: "Staff",
                        credit: "Credit",
                        cancelled: "Cancelled",
                        table: "Table Order",
                        takeaway: "Take Away",
                        delivery: "Delivery",
                        quick: "Quick Service"
                    },
                    descSort: {
                        label: "Description",
                        all: "Default",
                        aToZ: "A to Z",
                        menuId: "Menu ID"
                    },
                    qtySort: {
                        label: "Quantity",
                        all: "Default",
                        maxMin: "Max to Min",
                        minMax: "Min to Max"
                    },
                    amtSort: {
                        label: "Amount Sort",
                        all: "Default",
                        maxMin: "Max to Min",
                        minMax: "Min to Max"
                    },
                    special: {
                        label: "Special Filter",
                        all: "All",
                        void: "Void",
                        wastage: "Wastage",
                        refund: "Refund",
                        food: "Food",
                        beverage: "Beverage",
                        tobacco: "Tobacco",
                        other: "Other"
                    },
                    remark: {
                        label: "Remark",
                        all: "All",
                        void: "Void",
                        cancel: "Cancel",
                        discount: "Discount",
                        refund: "Refund"
                    }
                }
            }
        },
        kpi: {
            todayRevenue: "Today Revenue (LKR)",
            totalRevenue: "Total Revenue (LKR)",
            todayBills: "Today Bills",
            totalBills: "Total Bill Count",
            todayCancelled: "Today Cancelled",
            totalCancelled: "Total Cancelled",
            todayRefunds: "Today Refunds",
            totalRefunds: "Total Refunds",
            serviceCharge: "Total Service Charge",
            numberOfGuests: "Number of Guests",
            voidBills: "Void Bills",
            complimentary: "Complimentary",
            staff: "Staff Bills",
            totalDiscount: "Total Discount",
            fromYesterday: "from yesterday",
            vsPrevious: "vs previous period"
        },
        charts: {
            sales24h: "24-Hour Sales Trend",
            salesWeekly: "Weekly Sales Trend",
            topItems: "Top 3 Selling Items",
            orderTypeToday: "Today Order Type",
            orderTypeHistory: "Historical Order Types",
            paymentToday: "Today Payment Method",
            paymentHistory: "Historical Payment Methods"
        },
        history: {
            title: "Detailed Transaction Log",
            subtitle: "Filtered by Date Range",
            txnId: "Transaction ID",
            dateTime: "Date & Time",
            orderDetails: "Order Details",
            amount: "Amount (LKR)",
            type: "Type",
            status: "Status",
            completed: "Completed",
            cancelled: "Cancelled",
            refunded: "Refunded",
            dineIn: "Dine-in",
            delivery: "Delivery",
            takeaway: "Takeaway",
            showing: "Showing {start} to {end} of {total} transactions",
            previous: "Previous",
            next: "Next",
            export: "Export CSV",
            quickWeek: "Last Week",
            quickMonth: "Last Month",
            quickYear: "Last Year"
        },
        footer: {
            rights: "© 2026 Danu Dashboard",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            settings: "Settings"
        },
        login: {
            welcome: "Welcome back",
            subtitle: "Please enter your details to sign in",
            userId: "User ID",
            userIdPlaceholder: "Enter your ID",
            password: "Password",
            passwordPlaceholder: "••••••••",
            rememberMe: "Remember me",
            forgot: "Forgot?",
            signIn: "Sign in to Dashboard",
            signingIn: "Signing in...",
            footer: "Danu Dashboard v1.0 © 2026. All rights reserved."
        }
    },
    si: {
        navbar: {
            search: "ගනුදෙනු සොයන්න...",
            admin: "පරිපාලක පරිශීලක",
            connected: "සම්බන්ධ වී ඇත",
            logout: "පිටවන්න"
        },
        tabs: {
            todayTitle: "අද දින දළ විශ්ලේෂණය",
            historyTitle: "ඓතිහාසික ප්‍රවණතා",
            reportsTitle: "සවිස්තර වාර්තා",
            todaySub: "ආපන ශාලාවේ අද දින කාර්යසාධනය සජීවීව නිරීක්ෂණය කිරීම",
            historySub: "පසුගිය කාර්යසාධනය සහ දෘශ්‍ය ප්‍රවණතා විශ්ලේෂණය කරන්න",
            reportsSub: "සවිස්තරාත්මක ගනුදෙනු ලොගයන් බලන්න සහ අපනයනය කරන්න",
            realTime: "සජීවී",
            history: "ඉතිහාසය",
            reports: "වාර්තා",
            reportTypes: {
                bill: "බිල්පත් වාර්තාව",
                item: "අයිතම වාර්තාව",
                preview: "බිල්පත් පෙරදසුන",
                allCredit: "සියලුම ණය පාරිභෝගිකයන්",
                singleCredit: "තනි ණය පාරිභෝගිකයෙක්"
            },
            billReport: {
                headers: {
                    billId: "බිල්පත් අංකය",
                    amount: "වටිනාකම",
                    discountType: "වට්ටම් වර්ගය",
                    tax: "බදු (TAX)",
                    serviceCharge: "සේවා ගාස්තුව",
                    totalAmount: "මුළු එකතුව",
                    txnType: "ගනුදෙනු වර්ගය",
                    orderType: "ඇණවුම් වර්ගය",
                    remark: "විශේෂ සටහන්"
                },
                filters: {
                    txnType: {
                        label: "ගනුදෙනු වර්ගය",
                        all: "සියල්ල",
                        cash: "මුදල් (Cash)",
                        visa: "Visa",
                        master: "Master",
                        amex: "Amex",
                        uberEats: "Uber Eats",
                        pickMe: "PickMe Food",
                        complimentary: "හිමිකරුගේ (Complimentary)",
                        wastage: "අපතේ යාම් (Wastage)",
                        staff: "කාර්ය මණ්ඩලය (Staff)",
                        credit: "ණය (Credit)",
                        cancelled: "අවලංගු කළ (Cancelled)"
                    },
                    orderType: {
                        label: "ඇණවුම් වර්ගය",
                        all: "සියල්ල",
                        table: "මේස ඇණවුම්",
                        takeaway: "රැගෙන යාම",
                        delivery: "බෙදා හැරීම",
                        quick: "කඩිනම් සේවාව"
                    },
                    discountType: {
                        label: "වට්ටම් වර්ගය",
                        all: "සියල්ල",
                        manual: "නිශ්චිත අගයක්",
                        percentage: "ප්‍රතිශතයක්",
                        none: "වට්ටම් රහිත"
                    },
                    sort: {
                        label: "වටිනාකම අනුව",
                        minMax: "අඩුම සිට වැඩිම",
                        maxMin: "වැඩිම සිට අඩුම",
                        billNo: "බිල්පත් අංකය අනුව"
                    }
                }
            },
            itemReport: {
                headers: {
                    billId: "බිල්පත් අංකය",
                    kotNo: "KOT අංකය",
                    description: "විස්තරය",
                    qty: "ප්‍රමාණය",
                    amount: "වටිනාකම",
                    specialFilter: "විශේෂ පෙරහන",
                    reason: "හේතුව"
                },
                filters: {
                    mainType: {
                        label: "වර්ගය තෝරන්න",
                        all: "සියලුම වර්ග",
                        cash: "මුදල් (Cash)",
                        visa: "Visa",
                        master: "Master",
                        amex: "Amex",
                        uberEats: "Uber Eats",
                        pickMe: "PickMe Food",
                        complimentary: "හිමිකරුගේ (Complimentary)",
                        wastage: "අපතේ යාම් (Wastage)",
                        staff: "කාර්ය මණ්ඩලය (Staff)",
                        credit: "ණය (Credit)",
                        cancelled: "අවලංගු කළ (Cancelled)",
                        table: "මේස ඇණවුම්",
                        takeaway: "රැගෙන යාම",
                        delivery: "බෙදා හැරීම",
                        quick: "කඩිනම් සේවාව"
                    },
                    descSort: {
                        label: "විස්තරය අනුව",
                        all: "සාමාන්‍ය",
                        aToZ: "A සිට Z දක්වා",
                        menuId: "මෙනු අංකය (Menu ID)"
                    },
                    qtySort: {
                        label: "ප්‍රමාණය අනුව",
                        all: "සාමාන්‍ය",
                        maxMin: "වැඩිම සිට අඩුම",
                        minMax: "අඩුම සිට වැඩිම",
                    },
                    amtSort: {
                        label: "වටිනාකම අනුව",
                        all: "සාමාන්‍ය",
                        maxMin: "වැඩිම සිට අඩුම",
                        minMax: "අඩුම සිට වැඩිම",
                    },
                    special: {
                        label: "විශේෂ පෙරහන",
                        all: "සියල්ල",
                        void: "අවලංගු (Void)",
                        wastage: "අපතේ යාම් (Wastage)",
                        refund: "ප්‍රතිපූරණය (Refund)",
                        food: "ආහාර (Food)",
                        beverage: "පාන වර්ග (Beverage)",
                        tobacco: "දුම්කොළ (Tobacco)",
                        other: "වෙනත් (Other)"
                    },
                    remark: {
                        label: "විශේෂ සටහන්",
                        all: "සියල්ල",
                        void: "අවලංගු (Void)",
                        cancel: "අවලංගු කළ (Cancel)",
                        discount: "වට්ටම් (Discount)",
                        refund: "ප්‍රතිපූරණය (Refund)"
                    }
                }
            }
        },
        kpi: {
            todayRevenue: "අද දින ආදායම (LKR)",
            totalRevenue: "මුළු ආදායම (LKR)",
            todayBills: "අද බිල්පත් සංඛ්‍යාව",
            totalBills: "මුළු බිල්පත් සංඛ්‍යාව",
            todayCancelled: "අද අවලංගු කළ ඇණවුම්",
            totalCancelled: "මුළු අවලංගු කළ ඇණවුම්",
            todayRefunds: "අද දින මුදල් ආපසු ගෙවීම්",
            totalRefunds: "මුළු මුදල් ආපසු ගෙවීම්",
            serviceCharge: "මුළු සේවා ගාස්තුව",
            numberOfGuests: "අමුත්තන් සංඛ්‍යාව",
            voidBills: "අවලංගු කළ බිල්පත් (Void)",
            complimentary: "හිමිකරුගේ ",
            staff: "කාර්ය මණ්ඩලය",
            totalDiscount: "මුළු වට්ටම්",
            fromYesterday: "ඊයේ සිට",
            vsPrevious: "පෙර කාලයට සාපේක්ෂව"
        },
        charts: {
            sales24h: "පැය 24ක විකුණුම් ප්‍රවණතාව",
            salesWeekly: "සතිපතා විකුණුම් ප්‍රවණතාව",
            topItems: "වැඩිපුරම අලෙවි වන අයිතම 3",
            orderTypeToday: "අද ඇණවුම් වර්ගය",
            orderTypeHistory: "ඓතිහාසික ඇණවුම් වර්ග",
            paymentToday: "අද ගෙවීම් ක්‍රමය",
            paymentHistory: "ඓතිහාසික ගෙවීම් ක්‍රම"
        },
        history: {
            title: "සවිස්තරාත්මක ගනුදෙනු ලොගය",
            subtitle: "දිනය අනුව පෙරන ලද",
            txnId: "ගනුදෙනු අංකය",
            dateTime: "දිනය සහ වේලාව",
            orderDetails: "ඇණවුම් විස්තර",
            amount: "වටිනාකම (LKR)",
            type: "වර්ගය",
            status: "තත්ත්වය",
            completed: "සම්පූර්ණයි",
            cancelled: "අවලංගුයි",
            refunded: "ප්‍රතිපූරණය කරන ලදී",
            dineIn: "ආපනශාලාවේ",
            delivery: "බෙදා හැරීම",
            takeaway: "රැගෙන යාම",
            showing: "ගනුදෙනු {total} කින් {start} සිට {end} දක්වා පෙන්වයි",
            previous: "පෙර",
            next: "මීළඟ",
            export: "CSV අපනයනය",
            quickWeek: "පසුගිය සතිය",
            quickMonth: "පසුගිය මාසය",
            quickYear: "පසුගිය වසර"
        },
        footer: {
            rights: "© 2026 Danu Dashboard",
            privacy: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
            terms: "සේවා කොන්දේසි",
            settings: "සැකසුම්"
        },
        login: {
            welcome: "නැවතත් සාදරයෙන් පිළිගනිමු",
            subtitle: "ඇතුළු වීමට කරුණාකර ඔබේ විස්තර ඇතුළත් කරන්න",
            userId: "පරිශීලක හැඳුනුම්පත",
            userIdPlaceholder: "ඔබේ හැඳුනුම්පත ඇතුළත් කරන්න",
            password: "මුරපදය",
            passwordPlaceholder: "••••••••",
            rememberMe: "මතක තබා ගන්න",
            forgot: "අමතක වූවාද?",
            signIn: "දර්ශක පුවරුවට ඇතුළු වන්න",
            signingIn: "ඇතුළු වෙමින් පවතී...",
            footer: "Danu Dashboard v1.0 © 2026. සියලුම හිමිකම් ඇවිරිණි."
        }
    }
};
