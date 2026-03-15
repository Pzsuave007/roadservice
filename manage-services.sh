#!/bin/bash

echo "=========================================="
echo "  Server Status & Management"
echo "=========================================="
echo ""

# List of all backend services
SERVICES=(
    "bensroad-backend:8010:Ben's Road Service"
    "gradeprophet-backend:8001:GradeProphet"
    "espresso-backend:8002:Espresso Beso"
)

case "$1" in
    status)
        echo "📊 Checking all services..."
        echo ""
        for SERVICE_INFO in "${SERVICES[@]}"; do
            IFS=':' read -r SERVICE PORT NAME <<< "$SERVICE_INFO"
            STATUS=$(sudo systemctl is-active $SERVICE 2>/dev/null || echo "not found")
            if [ "$STATUS" == "active" ]; then
                RESPONSE=$(curl -s --max-time 2 http://localhost:$PORT/api/ 2>/dev/null || echo "no response")
                echo "✅ $NAME ($SERVICE) - Port $PORT - RUNNING"
                echo "   Response: $RESPONSE"
            elif [ "$STATUS" == "not found" ]; then
                echo "⚪ $NAME ($SERVICE) - Port $PORT - NOT CONFIGURED"
            else
                echo "❌ $NAME ($SERVICE) - Port $PORT - STOPPED"
            fi
            echo ""
        done
        ;;
    
    enable-all)
        echo "🔧 Enabling auto-start for all services..."
        echo ""
        for SERVICE_INFO in "${SERVICES[@]}"; do
            IFS=':' read -r SERVICE PORT NAME <<< "$SERVICE_INFO"
            if sudo systemctl list-unit-files | grep -q "$SERVICE"; then
                sudo systemctl enable $SERVICE
                echo "✅ Enabled: $NAME ($SERVICE)"
            else
                echo "⚪ Skipped: $NAME ($SERVICE) - not found"
            fi
        done
        echo ""
        echo "Done! Services will now auto-start when server reboots."
        ;;
    
    restart-all)
        echo "🔄 Restarting all services..."
        echo ""
        for SERVICE_INFO in "${SERVICES[@]}"; do
            IFS=':' read -r SERVICE PORT NAME <<< "$SERVICE_INFO"
            if sudo systemctl list-unit-files | grep -q "$SERVICE"; then
                sudo systemctl restart $SERVICE
                echo "✅ Restarted: $NAME ($SERVICE)"
            else
                echo "⚪ Skipped: $NAME ($SERVICE) - not found"
            fi
        done
        echo ""
        sleep 3
        echo "Checking status..."
        $0 status
        ;;
    
    start)
        if [ -z "$2" ]; then
            echo "Usage: $0 start <service-name>"
            exit 1
        fi
        sudo systemctl start $2
        sudo systemctl status $2 --no-pager
        ;;
    
    stop)
        if [ -z "$2" ]; then
            echo "Usage: $0 stop <service-name>"
            exit 1
        fi
        sudo systemctl stop $2
        echo "Stopped: $2"
        ;;
    
    logs)
        if [ -z "$2" ]; then
            echo "Usage: $0 logs <service-name>"
            exit 1
        fi
        sudo journalctl -u $2 -n 50 --no-pager
        ;;
    
    *)
        echo "Usage: $0 {status|enable-all|restart-all|start|stop|logs}"
        echo ""
        echo "Commands:"
        echo "  status       - Show status of all backend services"
        echo "  enable-all   - Enable auto-start for all services on boot"
        echo "  restart-all  - Restart all backend services"
        echo "  start <svc>  - Start a specific service"
        echo "  stop <svc>   - Stop a specific service"
        echo "  logs <svc>   - View logs for a specific service"
        echo ""
        echo "Examples:"
        echo "  $0 status"
        echo "  $0 enable-all"
        echo "  $0 logs bensroad-backend"
        ;;
esac
