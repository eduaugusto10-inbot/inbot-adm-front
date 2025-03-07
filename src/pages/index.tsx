import { ChangeEvent,  useEffect, useState } from 'react';
import api from '../utils/api';
import { ICustomerData } from './types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
export function AllPhones() {

    const [searchParams, setSearchParams] = useSearchParams();
    if (searchParams.get('token') === null) {
        window.location.href = "https://in.bot/inbot-admin";
    }
    
    const history = useNavigate();
    const [customerData, setCustomerData] = useState<ICustomerData[]>([])
    const [checkActivated, setCheckActivated] = useState<boolean>(true)
    const [checkDesactivated, setCheckDesactivated] = useState<boolean>(false)
    const [filtro, setFiltro] = useState<string>('')
    const [checkDesenvolvimento, setCheckDesenvolvimento] = useState(true);
    const [checkHomologacao, setCheckHomologacao] = useState(true);
    const [checkProducao, setCheckProducao] = useState(true);
    
    // Estados para ordenação
    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    
    function AddNewPhone() {
        history("/add");
    }
    function Change(phoneNumber: string) {
        history("/change", { state: { phoneNumber } });
    }

    useEffect(() => {
        api.get('/whats')
            .then(res => {
                setCustomerData(res.data)
            })
            .catch(error => console.log(error))
    }, [])

    // Função para ordenar os dados
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            // Se já estiver ordenando por esta coluna, inverte a direção
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Se for uma nova coluna, define ela como a coluna de ordenação e começa com ascendente
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Função para aplicar a ordenação aos dados filtrados
    const getSortedData = (data: ICustomerData[]) => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const valueA = a[sortColumn as keyof ICustomerData];
            const valueB = b[sortColumn as keyof ICustomerData];

            if (valueA === undefined || valueB === undefined) return 0;

            let comparison = 0;
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                comparison = valueA.localeCompare(valueB);
            } else {
                comparison = Number(valueA) - Number(valueB);
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    };

    const filteredCustomers = customerData.filter(customer => {
        const isActiveFilterValid = 
            (checkActivated && customer.activated) || 
            (checkDesactivated && !customer.activated);
    
        const isEnvironmentFilterValid = 
            (checkDesenvolvimento && customer.botServerType === 'dev') ||
            (checkHomologacao && customer.botServerType === 'staging') ||
            (checkProducao && customer.botServerType === 'production');
    
        if (filtro.trim() === '') return isActiveFilterValid && isEnvironmentFilterValid;
    
        const filtroNumero = Number(filtro);
        if (!isNaN(filtroNumero)) {
            return isActiveFilterValid && isEnvironmentFilterValid && (
                (customer.botId !== undefined && customer.botId.toString().includes(filtro)) ||
                (customer.number !== undefined && customer.number.toString().includes(filtro))
            );
        }
    
        return isActiveFilterValid && isEnvironmentFilterValid && 
            (customer.client?.toLowerCase() ?? '').includes(filtro.toLowerCase());
    });
    
    // Aplicar ordenação aos dados filtrados
    const sortedCustomers = getSortedData(filteredCustomers);
    
    const clearFiltro = () => {
        setFiltro("");
    };
    const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiltro(e.target.value);
      };

    // Componente para as setas de ordenação
    const SortArrows = ({ column }: { column: string }) => (
        <div style={{ display: "inline-flex", flexDirection: "column", marginLeft: "5px", cursor: "pointer" }}>
            <div 
                onClick={() => handleSort(column)} 
                style={{ 
                    width: 0, 
                    height: 0, 
                    borderLeft: "5px solid transparent", 
                    borderRight: "5px solid transparent", 
                    borderBottom: "5px solid " + (sortColumn === column && sortDirection === "asc" ? "#004488" : "#aaa"),
                    marginBottom: "2px"
                }}
            />
            <div 
                onClick={() => {
                    setSortColumn(column);
                    setSortDirection("desc");
                }} 
                style={{ 
                    width: 0, 
                    height: 0, 
                    borderLeft: "5px solid transparent", 
                    borderRight: "5px solid transparent", 
                    borderTop: "5px solid " + (sortColumn === column && sortDirection === "desc" ? "#004488" : "#aaa")
                }}
            />
        </div>
    );

    return (
        <div className='column-align' style={{width:"100vw", margin:"10px 0px", alignItems:"center"}}>
            <h1 style={{ fontSize: "23px", fontWeight: "bolder", color: "#004488", width: "100%" }} className="title_2024">Gestão de Números WhatsApp</h1>
            <div className="column-align" style={{width:"97%",alignItems:"center"}}>
                    <div className="hr_color" style={{width:"97%", marginTop:"15px"}}></div>
            </div>
            <div className='row-align' style={{ width:"90%", justifyContent:"space-between" }}>
                <div>
                <div style={{ margin: "20px 20px 20px 0px", display: "flex", alignItems: "center", position: "relative" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
  <input
    onChange={handleFiltroChange}
    value={filtro || ""}
    type="text"
    style={{
      borderRight: "none",
      width: "300px",
      borderRadius: "20px",
      paddingLeft: "20px",
      paddingRight: "40px",
    }}
    placeholder="Pesquisar ..."
  />
  {filtro && (
    <button
      onClick={clearFiltro}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "16px",
        color: "#888",
      }}
    >
      ✖
    </button>
  )}
</div>
</div>

                    <div style={{ alignContent: "center", color: "#004488", textAlign: 'left'}}>
                        <span><strong>Exibir números: </strong></span>
                        <input type="checkbox" style={{margin:"0px 5px 0px 10px"}} checked={checkActivated} onChange={(e) => setCheckActivated(e.target.checked)}/><span>Ativos</span>
                        <input type="checkbox" style={{margin:"0px 5px 0px 10px"}} checked={checkDesactivated} onChange={(e) => setCheckDesactivated(e.target.checked)}/><span>Inativos</span>
                    </div>
                    <div style={{ alignContent: "center", color: "#004488"}}>                                                
                        <div style={{ alignContent: "center", color: "#004488", marginBottom:'15px' }}>
        <span><strong>Ambiente Bot Server: </strong></span>
        <input type="checkbox" style={{ margin: "0px 5px 0px 10px" }} checked={checkDesenvolvimento} onChange={(e) => setCheckDesenvolvimento(e.target.checked)}/>
        <span>Desenvolvimento</span>
        <input type="checkbox" style={{ margin: "0px 5px 0px 10px" }} checked={checkHomologacao} onChange={(e) => setCheckHomologacao(e.target.checked)}/>
        <span>Homologação</span>
        <input type="checkbox" style={{ margin: "0px 5px 0px 10px" }} checked={checkProducao} onChange={(e) => setCheckProducao(e.target.checked)}/>
        <span>Produção</span>
                    </div>
                    </div>
                </div>
                <button onClick={AddNewPhone} className='button-blue' style={{margin:"20px 0px"}}>Adicionar</button>
            </div>
            
            <div style={{ width: "90%", textAlign: "left", margin: "10px 0" }}>
                <span style={{ color: "#004488", fontWeight: "bold" }}>
                    {sortedCustomers.length} resultado{sortedCustomers.length !== 1 ? 's' : ''} encontrado{sortedCustomers.length !== 1 ? 's' : ''}
                </span>
            </div>
            
            <table className="table-2024 fixed-header-table" style={{textAlign:"left", width:"90%"}}>
                <thead>
                    <tr className="cells table-2024 border-bottom-zero">
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Número</span>
                                <SortArrows column="number" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Cliente</span>
                                <SortArrows column="client" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Bot ID</span>
                                <SortArrows column="botId" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Ambiente Bot Server</span>
                                <SortArrows column="botServerType" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Servidor</span>
                                <SortArrows column="server" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Observação</span>
                                <SortArrows column="observation" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Origem</span>
                                <SortArrows column="origin" />
                            </div>
                        </th>
                        <th>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <span>Status</span>
                                <SortArrows column="activated" />
                            </div>
                        </th>
                        <th>Gerenciar</th>
                    </tr>
                </thead>
                <tbody>
                    {customerData && sortedCustomers.map((data, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e4e4e4' : '#FFF' }}>
                            <td><PhoneInput
                                    defaultCountry="br"
                                    value={data.number}
                                    disabled
                                    className="custom-phone-input"
                                    /></td>
                            <td>{data.client}</td>
                            <td>{data.botId}</td>
                            <td>{data.botServerType}</td>
                            <td>{data.server}</td>
                            <td>{data.observation}</td>
                            <td>{data.origin}</td>
                            <td><span style={{fontWeight: "bolder", color: data.activated ? "green" : "red"}}>{data.activated ? "Ativo" : "Inativo"}</span></td>
                            <td><button onClick={() => Change(data.number)} className='button-blue'>Alterar</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllPhones;