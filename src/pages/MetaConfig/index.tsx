import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { ToastContainer } from "react-toastify";

import info from "../../img/circle-info-solid.svg";
import "./index.css";

interface INumberLimit {
    number: string;
    dailyLimit: number;
    currentUsage: number;
    status: string;
}

export function MetaConfig() {
    const [searchParams] = useSearchParams();
    const botId = searchParams.get('bot_id');
    const [numberLimits, setNumberLimits] = useState<INumberLimit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('📊 Carregando informações de limites META...');
        fetchNumberLimits();
    }, [botId]);

    const fetchNumberLimits = async () => {
        try {
            console.log('🔍 Buscando limites para bot:', botId);
            // Simulando dados de limite - em produção, isso viria da API
            const mockData: INumberLimit[] = [
                {
                    number: "5511999887766",
                    dailyLimit: 1000,
                    currentUsage: 250,
                    status: "ativo"
                },
                {
                    number: "5511888776655",
                    dailyLimit: 500,
                    currentUsage: 450,
                    status: "próximo_limite"
                },
                {
                    number: "5511777665544",
                    dailyLimit: 2000,
                    currentUsage: 2000,
                    status: "limite_atingido"
                }
            ];
            
            setTimeout(() => {
                setNumberLimits(mockData);
                setLoading(false);
                console.log('✅ Limites carregados:', mockData);
            }, 1000);
        } catch (error) {
            console.error('❌ Erro ao carregar limites:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ativo":
                return "#28a745";
            case "próximo_limite":
                return "#ffc107";
            case "limite_atingido":
                return "#dc3545";
            default:
                return "#6c757d";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "ativo":
                return "✅ Ativo";
            case "próximo_limite":
                return "⚠️ Próximo ao Limite";
            case "limite_atingido":
                return "🚫 Limite Atingido";
            default:
                return "❓ Desconhecido";
        }
    };

    const formatNumber = (number: string) => {
        return number.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    };

    const getUsagePercentage = (current: number, limit: number) => {
        return Math.round((current / limit) * 100);
    };

    return (
        <div className="meta-config-container">
            <div className="container-trigger width-95-perc" style={{ padding: "10px 0px" }}>
                <ToastContainer limit={3} />
                <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">
                    📊 Configurações META - Limites de Disparo
                </h1>
                <div className="column-align" style={{ width: "97%", alignItems: "center" }}>
                    <div className="hr_color" style={{ width: "100%", marginTop: "15px" }}></div>
                </div>

                <div className="meta-info-section" style={{ 
                    backgroundColor: "#e3f2fd", 
                    border: "1px solid #2196f3", 
                    borderRadius: "8px", 
                    padding: "20px", 
                    margin: "20px 0",
                    width: "95%"
                }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                        <img src={info} width={20} height={20} alt="info" style={{ marginRight: "10px" }} />
                        <h3 style={{ margin: 0, color: "#1976d2" }}>ℹ️ Sobre os Limites de Disparo</h3>
                    </div>
                    <p style={{ margin: "10px 0", lineHeight: "1.6", color: "#333" }}>
                        Os limites de disparo são definidos pela META (WhatsApp Business API) para cada número cadastrado. 
                        Estes limites controlam quantas mensagens ativas (campanhas) podem ser enviadas por dia.
                    </p>
                    <ul style={{ marginLeft: "20px", color: "#333" }}>
                        <li><strong>Limite Diário:</strong> Número máximo de disparos permitidos por dia</li>
                        <li><strong>Uso Atual:</strong> Quantidade já utilizada hoje</li>
                        <li><strong>Status:</strong> Situação atual do número em relação ao limite</li>
                    </ul>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <div className="loading-spinner">🔄 Carregando informações...</div>
                    </div>
                ) : (
                    <div className="numbers-grid" style={{ width: "95%", margin: "20px 0" }}>
                        {numberLimits.map((numberData, index) => {
                            const percentage = getUsagePercentage(numberData.currentUsage, numberData.dailyLimit);
                            return (
                                <div key={index} className="number-card" style={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    padding: "20px",
                                    margin: "10px 0",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                                        <h4 style={{ margin: 0, color: "#333" }}>
                                            📱 {formatNumber(numberData.number)}
                                        </h4>
                                        <span style={{ 
                                            color: getStatusColor(numberData.status),
                                            fontWeight: "bold",
                                            fontSize: "14px"
                                        }}>
                                            {getStatusText(numberData.status)}
                                        </span>
                                    </div>
                                    
                                    <div className="usage-info" style={{ marginBottom: "15px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span>Uso Atual:</span>
                                            <span><strong>{numberData.currentUsage.toLocaleString()}</strong></span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span>Limite Diário:</span>
                                            <span><strong>{numberData.dailyLimit.toLocaleString()}</strong></span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                            <span>Disponível:</span>
                                            <span style={{ color: numberData.currentUsage >= numberData.dailyLimit ? "#dc3545" : "#28a745" }}>
                                                <strong>{(numberData.dailyLimit - numberData.currentUsage).toLocaleString()}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="progress-bar" style={{
                                        width: "100%",
                                        height: "20px",
                                        backgroundColor: "#f0f0f0",
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                        marginBottom: "10px"
                                    }}>
                                        <div style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            height: "100%",
                                            backgroundColor: percentage >= 90 ? "#dc3545" : percentage >= 70 ? "#ffc107" : "#28a745",
                                            transition: "width 0.3s ease"
                                        }}></div>
                                    </div>
                                    
                                    <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
                                        <strong>{percentage}%</strong> do limite utilizado
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="recommendations" style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "8px",
                    padding: "20px",
                    margin: "20px 0",
                    width: "95%"
                }}>
                    <h3 style={{ color: "#856404", marginBottom: "15px" }}>💡 Recomendações</h3>
                    <ul style={{ marginLeft: "20px", color: "#856404" }}>
                        <li>Monitore regularmente o uso dos seus números</li>
                        <li>Distribua campanhas grandes entre múltiplos números</li>
                        <li>Programe campanhas para horários de menor uso</li>
                        <li>Entre em contato com o suporte para aumentar limites se necessário</li>
                    </ul>
                </div>

                <div style={{ textAlign: "center", margin: "30px 0" }}>
                    <button 
                        onClick={() => window.close()} 
                        style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 24px",
                            fontSize: "14px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        ✅ Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MetaConfig;