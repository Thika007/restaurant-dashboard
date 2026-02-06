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
                    discountType: "Discount",
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
                        cardPay: "Card Pay",
                        credit: "Credit",
                        creditPaid: "Credit paid",
                        complimentary: "Complementary",
                        staff: "Staff",
                        cancel: "Cancel bill",
                        incomplete: "Incomplete Bill",
                        wastage: "Wastage"
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
                        label: "Discount",
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
                },
                pdfTitle: "Bill Report",
                pdfDateRange: "Date Range",
                pdfFilterSummary: "Filter Summary",
                pdfTotals: {
                    totalAmount: "Total Amount",
                    totalDiscount: "Total Discount",
                    totalTax: "Total TAX",
                    totalServiceCharge: "Total Service Charge",
                    grandTotal: "Grand Total"
                }
            },
            itemReport: {
                headers: {
                    itemCode: "Item Code",
                    description: "Description",
                    qty: "Qty",
                    amount: "Amount"
                },
                filters: {
                    txnType: {
                        label: "Transaction Type",
                        all: "All",
                        cash: "Cash",
                        cardPay: "Card Pay",
                        credit: "Credit",
                        creditPaid: "Credit paid",
                        refund: "Refund",
                        complimentary: "Complementary",
                        void: "Void",
                        staff: "Staff",
                        cancel: "Cancel bill",
                        incomplete: "Incomplete Bill",
                        wastage: "Wastage"
                    },
                    orderType: {
                        label: "Order Type",
                        all: "All",
                        table: "Table Order",
                        takeaway: "Take Away",
                        delivery: "Delivery",
                        quick: "Quick Service"
                    },
                    category: {
                        label: "Category"
                    },
                    subCategory: {
                        label: "Sub Category"
                    },
                    search: {
                        label: "Search Item",
                        placeholder: "Type item name..."
                    },
                    descSort: {
                        label: "Sort By Description",
                        all: "Default",
                        aToZ: "A to Z"
                    },
                    qtySort: {
                        label: "Sort By Quantity",
                        all: "Default",
                        maxMin: "Max to Min",
                        minMax: "Min to Max"
                    },
                    amtSort: {
                        label: "Sort By Amount",
                        all: "Default",
                        maxMin: "Max to Min",
                        minMax: "Min to Max"
                    }
                },
                pdfTitle: "Item Report",
                pdfFilterSummary: "Filter Summary"
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
                    discountType: "වට්ටම්",
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
                        cardPay: "කාඩ්පත් (Card Pay)",
                        credit: "ණය (Credit)",
                        creditPaid: "ණය ගෙවීම් (Credit paid)",
                        complimentary: "හිමිකරුගේ (Complimentary)",
                        staff: "කාර්ය මණ්ඩලය (Staff)",
                        cancel: "අවලංගු කළ බිල්පත් (Cancel bill)",
                        incomplete: "අසම්පූර්ණ බිල්පත් (Incomplete Bill)",
                        wastage: "අපතේ යාම් (Wastage)"
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
                        label: "වට්ටම්",
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
                },
                pdfTitle: "බිල්පත් වාර්තාව",
                pdfDateRange: "කාල පරාසය",
                pdfFilterSummary: "පෙරහන් සාරාංශය",
                pdfTotals: {
                    totalAmount: "මුළු එකතුව",
                    totalDiscount: "මුළු වට්ටම",
                    totalTax: "මුළු බදු",
                    totalServiceCharge: "මුළු සේවා ගාස්තුව",
                    grandTotal: "ශුද්ධ එකතුව"
                }
            },
            itemReport: {
                headers: {
                    itemCode: "අයිතම කේතය",
                    description: "විස්තරය",
                    qty: "ප්‍රමාණය",
                    amount: "වටිනාකම"
                },
                filters: {
                    txnType: {
                        label: "ගනුදෙනු වර්ගය",
                        all: "සියල්ල",
                        cash: "මුදල් (Cash)",
                        cardPay: "කාඩ්පත් (Card Pay)",
                        credit: "ණය (Credit)",
                        creditPaid: "ණය ගෙවීම් (Credit paid)",
                        refund: "ප්‍රතිපූරණ (Refund)",
                        complimentary: "හිමිකරුගේ (Complimentary)",
                        void: "අවලංගු (Void)",
                        staff: "කාර්ය මණ්ඩලය (Staff)",
                        cancel: "අවලංගු කළ බිල්පත් (Cancel bill)",
                        incomplete: "අසම්පූර්ණ බිල්පත් (Incomplete Bill)",
                        wastage: "අපතේ යාම් (Wastage)"
                    },
                    orderType: {
                        label: "ඇණවුම් වර්ගය",
                        all: "සියල්ල",
                        table: "මේස ඇණවුම්",
                        takeaway: "රැගෙන යාම",
                        delivery: "බෙදා හැරීම",
                        quick: "කඩිනම් සේවාව"
                    },
                    category: {
                        label: "ප්‍රධාන වර්ගය (Category)"
                    },
                    subCategory: {
                        label: "අනු වර්ගය (Sub Category)"
                    },
                    search: {
                        label: "අයිතමය සොයන්න",
                        placeholder: "අයිතමයේ නම ඇතුළත් කරන්න..."
                    },
                    descSort: {
                        label: "විස්තරය අනුව පෙළගස්වන්න",
                        all: "සාමාන්‍ය",
                        aToZ: "A සිට Z දක්වා"
                    },
                    qtySort: {
                        label: "ප්‍රමාණය අනුව පෙළගස්වන්න",
                        all: "සාමාන්‍ය",
                        maxMin: "වැඩිම සිට අඩුම",
                        minMax: "අඩුම සිට වැඩිම",
                    },
                    amtSort: {
                        label: "වටිනාකම අනුව පෙළගස්වන්න",
                        all: "සාමාන්‍ය",
                        maxMin: "වැඩිම සිට අඩුම",
                        minMax: "අඩුම සිට වැඩිම",
                    }
                },
                pdfTitle: "අයිතම වාර්තාව",
                pdfFilterSummary: "පෙරහන් සාරාංශය"
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
